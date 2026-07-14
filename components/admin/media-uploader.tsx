'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import {
  CheckCircle2,
  FileText,
  ImageIcon,
  LoaderCircle,
  RefreshCw,
  Trash2,
  UploadCloud,
} from 'lucide-react';

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'];
const MAX_FILE_SIZE = 6 * 1024 * 1024;

type UploadState = 'idle' | 'uploading' | 'success' | 'error';

function fileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function fileType(type: string) {
  const labels: Record<string, string> = {
    'image/png': 'PNG görsel',
    'image/jpeg': 'JPEG görsel',
    'image/webp': 'WebP görsel',
    'application/pdf': 'PDF belgesi',
  };
  return labels[type] ?? type;
}

export function MediaUploader() {
  const router = useRouter();
  const inputId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [state, setState] = useState<UploadState>('idle');
  const [message, setMessage] = useState('Yüklemek için bir dosya seçin.');
  const [validation, setValidation] = useState('');

  useEffect(() => {
    if (!file?.type.startsWith('image/')) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const chooseFile = () => inputRef.current?.click();

  const selectFile = (next: File | null) => {
    setFile(next);
    setProgress(0);
    setState('idle');
    setValidation('');
    setMessage(next ? `${next.name} yüklemeye hazır.` : 'Yüklemek için bir dosya seçin.');
    if (!next) return;
    if (!ACCEPTED_TYPES.includes(next.type)) {
      setValidation('Bu dosya türü desteklenmiyor. PNG, JPEG, WebP veya PDF seçin.');
    } else if (next.size > MAX_FILE_SIZE) {
      setValidation('Dosya 6 MB sınırını aşıyor. Daha küçük bir dosya seçin.');
    }
  };

  const removeFile = () => {
    selectFile(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!formRef.current || !file || validation) return;
    const formData = new FormData(formRef.current);
    const alt = String(formData.get('alt') ?? '').trim();
    if (file.type.startsWith('image/') && alt.length < 3) {
      setState('error');
      setMessage('Görseller için en az 3 karakterlik açıklayıcı alternatif metin girin.');
      return;
    }

    setState('uploading');
    setProgress(0);
    setMessage(`${file.name} güvenli biçimde doğrulanıyor ve yükleniyor.`);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/admin/media/upload');
    xhr.upload.onprogress = (uploadEvent) => {
      if (uploadEvent.lengthComputable) {
        setProgress(Math.round((uploadEvent.loaded / uploadEvent.total) * 100));
      }
    };
    xhr.onload = () => {
      let body: { error?: string } = {};
      try {
        body = JSON.parse(xhr.responseText || '{}') as { error?: string };
      } catch {
        body = {};
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        setProgress(100);
        setState('success');
        setMessage(`${file.name} doğrulandı ve medya kütüphanesine eklendi.`);
        router.refresh();
      } else {
        setState('error');
        setMessage(body.error ?? 'Yükleme tamamlanamadı. Dosyayı kontrol edip yeniden deneyin.');
      }
    };
    xhr.onerror = () => {
      setState('error');
      setMessage('Ağ bağlantısı kesildi. Bağlantıyı kontrol edip yeniden deneyin.');
    };
    xhr.send(formData);
  }

  const uploading = state === 'uploading';

  return (
    <form
      ref={formRef}
      onSubmit={submit}
      className="rounded-card-lg border border-cherie-lace bg-white/70 p-4 shadow-card sm:p-6"
    >
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-cherie-brass/10 text-cherie-brass">
          <UploadCloud className="size-5" />
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-cherie-brass">Güvenli yükleme</p>
          <h2 className="font-display text-2xl leading-tight text-cherie-ink sm:text-3xl">Yeni medya yükle</h2>
          <p className="mt-1 text-sm leading-6 text-cherie-soft-ink">PNG, JPEG, WebP veya PDF · en fazla 6 MB</p>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,.75fr)]">
        <div
          aria-describedby={`${inputId}-help ${inputId}-status`}
          onDragEnter={(event) => {
            event.preventDefault();
            if (!uploading) setDragging(true);
          }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragging(false);
          }}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            if (!uploading) selectFile(event.dataTransfer.files[0] ?? null);
          }}
          className={`group relative flex min-h-64 flex-col items-center justify-center overflow-hidden rounded-card border border-dashed px-5 py-8 text-center transition-colors ${
            dragging
              ? 'border-cherie-burgundy bg-cherie-burgundy/5'
              : 'border-cherie-brass/60 bg-cherie-paper/55 hover:border-cherie-burgundy hover:bg-cherie-paper'
          } ${uploading ? 'opacity-75' : ''}`}
        >
          <input
            ref={inputRef}
            id={inputId}
            required
            type="file"
            name="file"
            accept={ACCEPTED_TYPES.join(',')}
            className="sr-only"
            aria-label="Yüklenecek dosya"
            disabled={uploading}
            onChange={(event) => selectFile(event.target.files?.[0] ?? null)}
          />

          {file ? (
            <div className="w-full">
              <div className="relative mx-auto flex aspect-[16/9] w-full max-w-md items-center justify-center overflow-hidden rounded-card border border-cherie-lace bg-white">
                {preview ? (
                  <Image src={preview} alt="Seçilen dosya önizlemesi" fill unoptimized className="object-contain" />
                ) : (
                  <FileText className="size-12 text-cherie-brass" aria-hidden="true" />
                )}
              </div>
              <p className="mt-4 break-all text-base font-semibold text-cherie-ink">{file.name}</p>
              <p className="mt-1 text-sm text-cherie-soft-ink">{fileType(file.type)} · {fileSize(file.size)}</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  disabled={uploading}
                  onClick={(event) => {
                    event.stopPropagation();
                    chooseFile();
                  }}
                  className="cherie-button-secondary min-h-11 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RefreshCw className="size-4" />
                  Dosyayı değiştir
                </button>
                <button
                  type="button"
                  disabled={uploading}
                  onClick={(event) => {
                    event.stopPropagation();
                    removeFile();
                  }}
                  className="inline-flex min-h-11 items-center gap-2 rounded-control px-3 text-sm font-semibold text-cherie-error hover:bg-cherie-error/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 className="size-4" />
                  Kaldır
                </button>
              </div>
            </div>
          ) : (
            <>
              <span className="grid size-14 place-items-center rounded-full bg-white text-cherie-burgundy shadow-sm transition-transform group-hover:-translate-y-0.5">
                <ImageIcon className="size-6" />
              </span>
              <p className="mt-4 text-base font-semibold text-cherie-ink">Dosyayı buraya sürükleyin</p>
              <p className="mt-1 text-sm text-cherie-soft-ink">veya bilgisayarınızdan güvenle seçin</p>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  chooseFile();
                }}
                className="mt-5 min-h-11 rounded-control bg-cherie-burgundy px-5 text-sm font-bold text-white transition-colors hover:bg-cherie-velvet focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cherie-focus"
              >
                Dosya seç
              </button>
            </>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <label className="grid gap-2 text-sm font-semibold text-cherie-ink">
            Başlık <span className="font-normal text-cherie-soft-ink">(isteğe bağlı)</span>
            <input name="title" maxLength={120} className="cherie-field" disabled={uploading} />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-cherie-ink">
            Alternatif metin
            <input name="alt" maxLength={240} className="cherie-field" disabled={uploading} />
            <span id={`${inputId}-help`} className="text-xs font-normal leading-5 text-cherie-soft-ink">Görseller için zorunludur; görselin amacını kısa ve açık anlatın.</span>
          </label>

          <div id={`${inputId}-status`} className="mt-auto" aria-live="polite" aria-atomic="true">
            {uploading && (
              <div className="mb-3">
                <div
                  role="progressbar"
                  aria-label="Yükleme ilerlemesi"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progress}
                  className="h-2 overflow-hidden rounded-full bg-cherie-lace"
                >
                  <div className="h-full bg-cherie-burgundy transition-[width]" style={{ width: `${progress}%` }} />
                </div>
                <p className="mt-2 text-sm font-semibold text-cherie-ink">Yükleniyor: %{progress}</p>
              </div>
            )}
            {(validation || message) && (
              <p
                role={validation || state === 'error' ? 'alert' : 'status'}
                className={`rounded-control border p-3 text-sm leading-5 ${
                  validation || state === 'error'
                    ? 'border-cherie-error/30 bg-cherie-error/10 text-cherie-error'
                    : state === 'success'
                      ? 'border-cherie-success/30 bg-cherie-success/10 text-cherie-success'
                      : 'border-cherie-lace bg-cherie-paper text-cherie-soft-ink'
                }`}
              >
                {state === 'success' && <CheckCircle2 className="mr-2 inline size-4" aria-hidden="true" />}
                {validation || message}
              </p>
            )}
          </div>

          <button
            disabled={!file || Boolean(validation) || uploading || state === 'success'}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-control bg-cherie-burgundy px-5 text-sm font-bold text-white transition-colors hover:bg-cherie-velvet focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cherie-focus disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
            {state === 'success' ? 'Yüklendi' : state === 'error' ? 'Yeniden dene' : uploading ? 'Yükleniyor…' : 'Doğrula ve yükle'}
          </button>
        </div>
      </div>
    </form>
  );
}
