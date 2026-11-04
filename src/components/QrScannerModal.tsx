import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  CameraOff, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  X, 
  Sparkles, 
  Globe, 
  CornerDownLeft, 
  ShieldCheck,
  History,
  QrCode,
  Wifi,
  WifiOff,
  RefreshCw,
  Sliders,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import jsQR from 'jsqr';
import { CheckInAction, CheckInResponse, Member, GasConfig, GasConnectionState } from '../types';
import { processCheckIn } from '../utils/logic';
import { playChime } from '../utils/audio';

interface QrScannerModalProps {
  members: Member[];
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
  config: GasConfig;
  gasConnection: GasConnectionState;
  setGasConnection: React.Dispatch<React.SetStateAction<GasConnectionState>>;
  onClose: () => void;
  onOpenBadge: (member: Member) => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  members,
  setMembers,
  config,
  gasConnection,
  setGasConnection,
  onClose,
  onOpenBadge,
}) => {
  const [action, setAction] = useState<CheckInAction>('entree');
  const [manualInput, setManualInput] = useState('');
  const [lastResponse, setLastResponse] = useState<CheckInResponse | null>(null);
  const [recentLogs, setRecentLogs] = useState<CheckInResponse[]>([]);
  const [useCamera, setUseCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCallingGas, setIsCallingGas] = useState(false);
  const [showConfigGas, setShowConfigGas] = useState(false);
  const [testStatus, setTestStatus] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const lastScannedCodeRef = useRef<string>('');
  const lastScannedTimeRef = useRef<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input automatically on open
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Frame scanning loop via jsQR
  const scanQrFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth',
        });

        if (code && code.data) {
          const raw = code.data.trim();
          const now = Date.now();
          // Debounce same QR code for 3 seconds
          if (raw !== lastScannedCodeRef.current || now - lastScannedTimeRef.current > 3000) {
            lastScannedCodeRef.current = raw;
            lastScannedTimeRef.current = now;

            // Extract ID if the QR contains a full URL like ...?id=MBR-0001
            let parsedId = raw;
            try {
              if (raw.includes('id=')) {
                const url = new URL(raw.startsWith('http') ? raw : `https://dummy.com/${raw}`);
                parsedId = url.searchParams.get('id') || raw;
              }
            } catch {
              parsedId = raw;
            }

            triggerCheckIn(parsedId);
          }
        }
      }
    }

    animFrameIdRef.current = requestAnimationFrame(scanQrFrame);
  };

  // Start / stop camera stream
  useEffect(() => {
    if (useCamera) {
      navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'environment' } })
        .then((stream) => {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().then(() => {
              animFrameIdRef.current = requestAnimationFrame(scanQrFrame);
            }).catch(() => {});
          }
          setCameraError(null);
        })
        .catch((err) => {
          console.warn('Camera error:', err);
          setCameraError('Accès caméra indisponible ou non autorisé.');
          setUseCamera(false);
        });
    } else {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    }

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [useCamera]);

  // Helper to normalize gas URL (supports pasting full URL or just the deployment ID)
  const getNormalizedGasUrl = (url: string): string => {
    const trimmed = url.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    return `https://script.google.com/macros/s/${trimmed}/exec`;
  };

  // Main check-in handler communicating with Google Apps Script + Local state
  const triggerCheckIn = async (rawId: string) => {
    if (!rawId.trim()) return;

    const memberId = rawId.trim().toUpperCase();

    // 1. Local logic update
    const { updatedMembers, response } = processCheckIn(members, memberId, action);
    setMembers(updatedMembers);

    // 2. Real Google Apps Script network call if URL configured
    let gasSynced = false;
    const normalizedUrl = getNormalizedGasUrl(gasConnection.webAppUrl);
    if (normalizedUrl.startsWith('http')) {
      setIsCallingGas(true);
      try {
        const gasUrl = new URL(normalizedUrl);
        gasUrl.searchParams.set('id', memberId);
        gasUrl.searchParams.set('action', action);
        gasUrl.searchParams.set('format', 'json');

        // We trigger using fetch. Google Apps Script redirects with 302.
        await fetch(gasUrl.toString(), { mode: 'no-cors' });
        gasSynced = true;
      } catch (err) {
        console.warn('Erreur appel Google Apps Script:', err);
      } finally {
        setIsCallingGas(false);
      }
    }

    const finalResponse: CheckInResponse = {
      ...response,
      fromGoogleAppsScript: gasSynced,
    };

    setLastResponse(finalResponse);

    if (finalResponse.success) {
      setRecentLogs((prev) => [finalResponse, ...prev.slice(0, 9)]);

      if (action === 'entree') {
        playChime('success');
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.65 },
          colors: ['#10B981', '#3B82F6', '#F59E0B'],
        });
      } else {
        playChime('sortie');
      }
    } else {
      playChime('error');
    }

    setManualInput('');
  };

  const handleTestGasConnection = async () => {
    const normalized = getNormalizedGasUrl(gasConnection.webAppUrl);
    if (!normalized.startsWith('http')) {
      setTestStatus('Veuillez renseigner une URL valide ou votre ID de déploiement (ex: AKfycb...)');
      return;
    }

    setGasConnection((prev) => ({ ...prev, webAppUrl: normalized, isTesting: true }));
    setTestStatus('Test en cours de communication avec Google Apps Script...');

    try {
      const testUrl = new URL(normalized);
      testUrl.searchParams.set('id', 'TEST-PING');
      testUrl.searchParams.set('action', 'entree');
      testUrl.searchParams.set('format', 'json');

      await fetch(testUrl.toString(), { mode: 'no-cors' });
      setGasConnection((prev) => ({
        ...prev,
        webAppUrl: normalized,
        isConnected: true,
        isTesting: false,
        lastTestedAt: new Date().toLocaleTimeString(),
      }));
      setTestStatus('✅ Connexion établie avec l\'application Web Google Apps Script !');
      localStorage.setItem('gas_web_app_url', normalized);
    } catch {
      setGasConnection((prev) => ({ ...prev, isConnected: false, isTesting: false }));
      setTestStatus('❌ Impossible de joindre l\'URL. Vérifiez les autorisations "Qui a accès : N\'importe qui".');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerCheckIn(manualInput);
  };

  return (
    <div className="space-y-6">
      {/* Hidden canvas for jsQR image decoding */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Top Banner & Control Bar */}
      <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
              <h2 className="text-xl font-black">Scanner QR Code Connecté Google Apps Script</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Pointez avec la caméra ou l'ID pour mettre à jour la colonne K (Statut), L (Entrée) et M (Sortie)
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center p-1.5 rounded-xl bg-slate-950 border border-slate-800">
            <button
              type="button"
              onClick={() => setAction('entree')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                action === 'entree'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-400/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>POINTAGE ENTRÉE</span>
            </button>

            <button
              type="button"
              onClick={() => setAction('sortie')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                action === 'sortie'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-2 ring-blue-400/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>POINTAGE SORTIE</span>
            </button>
          </div>
        </div>

        {/* Input & Camera Options */}
        <div className="mt-5 pt-4 border-t border-slate-800 grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Main Manual / Scanner Input Bar */}
          <div className="lg:col-span-8 space-y-3.5">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <QrCode className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={`Scanner un badge ou taper l'ID (ex: ${config.idPrefix}0001)...`}
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                className={`px-6 py-3 rounded-xl font-bold text-xs text-white transition-all shadow-md flex items-center gap-1.5 cursor-pointer ${
                  action === 'entree' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                <span>Pointer</span>
                <CornerDownLeft className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Click Badges for testing without camera */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-400">Raccourcis rapides :</span>
              {members.slice(0, 5).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => triggerCheckIn(m.id)}
                  className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-mono transition-colors cursor-pointer"
                >
                  {m.id} ({m.nom})
                </button>
              ))}
            </div>

            {/* Google Apps Script Connection Box */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold text-slate-200">
                    Liaison Google Apps Script (Web App doGet)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowConfigGas(!showConfigGas)}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
                >
                  {showConfigGas ? 'Masquer configuration' : 'Configurer l\'URL'}
                </button>
              </div>

              {showConfigGas && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <p className="text-[11px] text-slate-400">
                    Collez l'URL de votre déploiement d'Application Web (ex: <code className="text-blue-300">https://script.google.com/macros/s/.../exec</code>) pour envoyer chaque pointage directement dans votre feuille Google Sheets :
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                      value={gasConnection.webAppUrl}
                      onChange={(e) => setGasConnection({ ...gasConnection, webAppUrl: e.target.value })}
                      className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleTestGasConnection}
                      className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer flex items-center gap-1.5 shrink-0"
                    >
                      {gasConnection.isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Wifi className="w-3.5 h-3.5" />}
                      <span>Tester</span>
                    </button>
                  </div>
                  {testStatus && (
                    <p className="text-xs font-medium text-slate-300 bg-slate-900 p-2 rounded border border-slate-800">
                      {testStatus}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Live Camera Scanner Window */}
          <div className="lg:col-span-4 bg-slate-950 rounded-xl border border-slate-800 p-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-emerald-400" /> Caméra &amp; Décodeur QR
                </span>
                <button
                  type="button"
                  onClick={() => setUseCamera(!useCamera)}
                  className={`px-3 py-1 rounded text-xs font-bold cursor-pointer transition-colors ${
                    useCamera ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  {useCamera ? 'Couper caméra' : 'Activer caméra'}
                </button>
              </div>

              {cameraError && (
                <p className="text-[11px] text-amber-400 bg-amber-950/30 p-2 rounded border border-amber-800/40 mb-2">
                  {cameraError}
                </p>
              )}

              {useCamera ? (
                <div className="relative aspect-video rounded-lg overflow-hidden bg-black border border-emerald-500/50 shadow-inner">
                  <video
                    ref={videoRef}
                    playsInline
                    autoPlay
                    muted
                    className="w-full h-full object-cover"
                  />
                  {/* Visual target reticle */}
                  <div className="absolute inset-0 border-2 border-emerald-400/70 m-5 rounded-xl pointer-events-none animate-pulse flex items-center justify-center">
                    <span className="text-[10px] text-emerald-300 font-mono bg-black/60 px-2 py-0.5 rounded">
                      Centrez le QR Code
                    </span>
                  </div>
                </div>
              ) : (
                <div className="aspect-video rounded-lg bg-slate-900/60 border border-dashed border-slate-800 flex flex-col items-center justify-center p-4 text-center">
                  <CameraOff className="w-7 h-7 text-slate-600 mb-1.5" />
                  <span className="text-xs text-slate-400 font-medium">Caméra en veille</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Cliquez sur "Activer caméra" pour flasher les badges imprimés ou écrans
                  </p>
                </div>
              )}
            </div>

            <p className="text-[10px] text-slate-500 mt-2 text-center">
              Décodage temps réel automatique (jsQR) + Sonore &amp; Haptique
            </p>
          </div>
        </div>
      </div>

      {/* Immediate Result Card */}
      {lastResponse && (
        <div
          className={`rounded-2xl border p-6 shadow-xl transition-all animate-in fade-in zoom-in-95 ${
            lastResponse.success
              ? lastResponse.action === 'entree'
                ? 'bg-gradient-to-br from-emerald-950/40 to-slate-900 border-emerald-500/50'
                : 'bg-gradient-to-br from-blue-950/40 to-slate-900 border-blue-500/50'
              : 'bg-gradient-to-br from-red-950/40 to-slate-900 border-red-500/50'
          }`}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-lg shrink-0 ${
                  lastResponse.success
                    ? lastResponse.action === 'entree'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-blue-500 text-white'
                    : 'bg-red-500 text-white'
                }`}
              >
                {lastResponse.success ? (lastResponse.action === 'entree' ? '✅' : '👋') : '❌'}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      lastResponse.success
                        ? lastResponse.action === 'entree'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {lastResponse.success
                      ? lastResponse.action === 'entree'
                        ? 'ENTRÉE CONFIRMÉE'
                        : 'SORTIE CONFIRMÉE'
                      : 'ERREUR DE SCAN'}
                  </span>
                  <span className="font-mono text-xs text-slate-400 font-bold">
                    {lastResponse.memberId}
                  </span>
                </div>

                {lastResponse.success ? (
                  <>
                    <h3 className="text-2xl font-bold text-white mt-1">
                      {lastResponse.memberName}
                    </h3>
                    <p className="text-xs text-slate-300">
                      {lastResponse.memberTitle} — {lastResponse.institution}
                    </p>
                  </>
                ) : (
                  <p className="text-sm font-semibold text-red-300 mt-1">
                    {lastResponse.message}
                  </p>
                )}
              </div>
            </div>

            {/* Timestamp & Warning */}
            <div className="flex flex-col items-end gap-1.5 w-full md:w-auto">
              <div className="bg-slate-950/80 px-3.5 py-2 rounded-xl border border-slate-800 text-right">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                  Horodatage Consigné
                </span>
                <span className="text-sm font-mono font-bold text-slate-200">
                  {lastResponse.timestamp}
                </span>
              </div>

              {lastResponse.warning && (
                <div className="bg-red-500/20 text-red-300 border border-red-500/40 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                  <span>{lastResponse.warning}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recent History Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <History className="w-4 h-4 text-slate-600" />
          <h3 className="text-sm font-bold text-slate-900">Historique des 10 derniers pointages</h3>
        </div>

        {recentLogs.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-2">
            Aucun scan effectué durant cette session. Utilisez la caméra ou les boutons rapides pour pointer un participant.
          </p>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {recentLogs.map((log, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.action === 'entree'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {log.action.toUpperCase()}
                  </span>
                  <span className="font-mono font-bold text-slate-800">{log.memberId}</span>
                  <span className="font-semibold text-slate-900">{log.memberName}</span>
                  <span className="text-slate-500 hidden sm:inline">({log.memberTitle})</span>
                </div>

                <div className="flex items-center gap-3">
                  {log.cotisation === 'Non' && (
                    <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                      Non cotisant
                    </span>
                  )}
                  <span className="font-mono text-slate-500">{log.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
