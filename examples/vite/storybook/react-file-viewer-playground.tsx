/* eslint-disable react-refresh/only-export-components */
import React from "react";
import { createRoot, type Root } from "react-dom/client";
import { FileViewer } from "../../../dist/main.js";

type DemoExample = "image" | "pdf" | "xlsx" | "docx" | "pptx";

type DemoTheme = "auto" | "light" | "dark";

interface DemoProps {
  defaultExample?: DemoExample;
  allowUpload?: boolean;
  allowExampleSwitch?: boolean;
  viewerHeight?: number;
  omit?: string[];
  fallbackTitle?: string;
  theme?: DemoTheme;
}

interface FileState {
  file: Blob;
  fileType: string;
  label: string;
}

declare global {
  interface HTMLElementTagNameMap {
    "react-file-viewer-playground": ReactFileViewerPlaygroundElement;
  }
}

const styles = {
  frame: {
    border: "1px solid #d9e2ec",
    borderRadius: "16px",
    background: "#ffffff",
    overflow: "hidden",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
  },
  toolbar: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: "10px",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 14px",
    borderBottom: "1px solid #e5e7eb",
    background: "#f8fafc",
  },
  toolbarGroup: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: "8px",
    alignItems: "center",
  },
  label: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#334155",
    letterSpacing: "0.02em",
    textTransform: "uppercase" as const,
  },
  button: {
    border: "1px solid #cbd5e1",
    borderRadius: "999px",
    background: "#ffffff",
    color: "#0f172a",
    fontSize: "13px",
    fontWeight: 600,
    padding: "7px 12px",
    cursor: "pointer",
  },
  buttonActive: {
    borderColor: "#0f172a",
    background: "#0f172a",
    color: "#ffffff",
  },
  upload: {
    fontSize: "13px",
    color: "#334155",
  },
  meta: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    padding: "12px 14px",
    borderBottom: "1px solid #e5e7eb",
    background: "#ffffff",
    fontSize: "13px",
    color: "#475569",
  },
  viewerShell: {
    height: "100%",
    minHeight: "320px",
    background: "#f1f5f9",
  },
  fallback: {
    height: "100%",
    minHeight: "280px",
    display: "grid",
    placeItems: "center",
    background: "#f8fafc",
    color: "#0f172a",
    padding: "24px",
    textAlign: "center" as const,
    fontFamily: "system-ui, sans-serif",
  },
  fallbackCard: {
    maxWidth: "360px",
    border: "1px solid #dbeafe",
    borderRadius: "14px",
    background: "#eff6ff",
    padding: "18px 20px",
  },
  fallbackTitle: {
    margin: "0 0 6px",
    fontSize: "16px",
    fontWeight: 700,
  },
  fallbackText: {
    margin: 0,
    fontSize: "13px",
    lineHeight: 1.5,
    color: "#334155",
  },
} as const;

const sampleSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720" viewBox="0 0 1200 720">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#1d4ed8" />
    </linearGradient>
  </defs>
  <rect width="1200" height="720" fill="url(#bg)" rx="36" />
  <circle cx="1020" cy="120" r="90" fill="#38bdf8" opacity="0.55" />
  <circle cx="170" cy="580" r="120" fill="#f59e0b" opacity="0.45" />
  <text x="92" y="180" fill="#e2e8f0" font-family="Arial, sans-serif" font-size="36">Quarterly brief</text>
  <text x="92" y="250" fill="#ffffff" font-family="Arial, sans-serif" font-size="82" font-weight="700">Launch assets</text>
  <text x="92" y="320" fill="#bfdbfe" font-family="Arial, sans-serif" font-size="28">A lightweight image sample rendered through FileViewer.</text>
  <rect x="92" y="390" width="420" height="180" rx="24" fill="#ffffff" opacity="0.14" />
  <text x="130" y="460" fill="#ffffff" font-family="Arial, sans-serif" font-size="26">Preview controls</text>
  <text x="130" y="505" fill="#dbeafe" font-family="Arial, sans-serif" font-size="22">Zoom in, zoom out and custom upload.</text>
</svg>
`;

function escapePdfText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function createSamplePdf() {
  const stream = [
    "BT",
    "/F1 22 Tf",
    "48 180 Td",
    `(${escapePdfText("react-file-viewer-v2")}) Tj`,
    "0 -30 Td",
    "/F1 13 Tf",
    `(${escapePdfText("Sample PDF generated for Storybook documentation.")}) Tj`,
    "0 -22 Td",
    `(${escapePdfText("The same component can render local uploads and generated previews.")}) Tj`,
    "ET",
  ].join("\n");

  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Count 1 /Kids [3 0 R] >>\nendobj\n",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 240] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n",
    `4 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj\n`,
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (const object of objects) {
    offsets.push(pdf.length);
    pdf += object;
  }

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (const offset of offsets.slice(1)) {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
}

async function createSampleFile(example: DemoExample): Promise<FileState> {
  if (example === "pdf") {
    return {
      file: createSamplePdf(),
      fileType: "pdf",
      label: "Bundled PDF sample",
    };
  }

  if (example === "xlsx" || example === "docx" || example === "pptx") {
    const response = await fetch(`/samples/sample.${example}`);
    const file = await response.blob();

    return {
      file,
      fileType: example,
      label: `Bundled ${example.toUpperCase()} sample`,
    };
  }

  return {
    file: new Blob([sampleSvg], { type: "image/svg+xml" }),
    fileType: "png",
    label: "Bundled image sample",
  };
}

function getExtension(fileName: string) {
  const segments = fileName.split(".");
  return segments.length > 1 ? segments.at(-1)?.toLowerCase() ?? "" : "";
}

function DemoApp({
  defaultExample = "image",
  allowUpload = true,
  allowExampleSwitch = true,
  viewerHeight = 420,
  omit = [],
  fallbackTitle = "This preview type is intentionally disabled for the current example.",
  theme = "auto",
}: DemoProps) {
  const [fileState, setFileState] = React.useState<FileState | null>(null);
  const [example, setExample] = React.useState<DemoExample>(defaultExample);
  const [isSampleLoading, setIsSampleLoading] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setExample(defaultExample);
      setIsSampleLoading(true);
      const nextFile = await createSampleFile(defaultExample);
      if (!isMounted) return;
      setFileState(nextFile);
      setIsSampleLoading(false);
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, [defaultExample]);

  const selectBundledSample = async (next: DemoExample) => {
    setExample(next);
    setIsSampleLoading(true);
    const nextFile = await createSampleFile(next);
    setFileState(nextFile);
    setIsSampleLoading(false);
  };

  const onUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0];
    if (!nextFile) return;
    setFileState({
      file: nextFile,
      fileType: getExtension(nextFile.name),
      label: `Uploaded file: ${nextFile.name}`,
    });
    setIsSampleLoading(false);
  };

  const fallback = (
    <div style={styles.fallback}>
      <div style={styles.fallbackCard}>
        <p style={styles.fallbackTitle}>{fallbackTitle}</p>
        <p style={styles.fallbackText}>
          Use this pattern when your product needs a branded fallback instead of the default unsupported state.
        </p>
      </div>
    </div>
  );

  return (
    <div style={styles.frame}>
      <div style={styles.toolbar}>
        <div style={styles.toolbarGroup}>
          <span style={styles.label}>Examples</span>
          {allowExampleSwitch && (
            <>
              {[
                { value: "image", label: "Image" },
                { value: "pdf", label: "PDF" },
                { value: "xlsx", label: "XLSX" },
                { value: "docx", label: "DOCX" },
                { value: "pptx", label: "PPTX" },
              ].map((sample) => (
                <button
                  key={sample.value}
                  type="button"
                  style={{
                    ...styles.button,
                    ...(example === sample.value ? styles.buttonActive : {}),
                  }}
                  onClick={() => void selectBundledSample(sample.value as DemoExample)}
                >
                  {sample.label}
                </button>
              ))}
            </>
          )}
        </div>

        {allowUpload && (
          <label style={styles.upload}>
            Upload a local file
            <input
              type="file"
              accept=".png,.jpg,.jpeg,.gif,.bmp,.pdf,.docx,.xlsx,.pptx,.webm,.mp4"
              onChange={onUpload}
              style={{ display: "block", marginTop: "6px" }}
            />
          </label>
        )}
      </div>

      <div style={styles.meta}>
        <span>{fileState?.label ?? "Preparing sample preview..."}</span>
        <span>Resolved type: {fileState?.fileType || "unknown"}</span>
      </div>

      <div style={{ ...styles.viewerShell, height: `${viewerHeight}px` }}>
        {isSampleLoading || !fileState ? (
          <div style={styles.fallback}>
            <div style={styles.fallbackCard}>
              <p style={styles.fallbackTitle}>Preparing preview</p>
              <p style={styles.fallbackText}>
                The selected sample is loading so the viewer can render a real file package.
              </p>
            </div>
          </div>
        ) : (
          <FileViewer
            file={fileState.file}
            fileType={fileState.fileType}
            omit={omit}
            theme={theme}
            unsupportedComponent={fallback}
          />
        )}
      </div>
    </div>
  );
}

class ReactFileViewerPlaygroundElement extends HTMLElement {
  private reactRoot: Root | null = null;
  private readonly container: HTMLDivElement;
  private props: DemoProps = {};

  constructor() {
    super();
    this.container = document.createElement("div");
  }

  connectedCallback() {
    if (!this.contains(this.container)) {
      this.appendChild(this.container);
    }

    if (!this.reactRoot) {
      this.reactRoot = createRoot(this.container);
    }

    this.renderReactTree();
  }

  disconnectedCallback() {
    this.reactRoot?.unmount();
    this.reactRoot = null;
  }

  set defaultExample(value: DemoExample | undefined) {
    this.props.defaultExample = value;
    this.renderReactTree();
  }

  set allowUpload(value: boolean | undefined) {
    this.props.allowUpload = value;
    this.renderReactTree();
  }

  set allowExampleSwitch(value: boolean | undefined) {
    this.props.allowExampleSwitch = value;
    this.renderReactTree();
  }

  set viewerHeight(value: number | undefined) {
    this.props.viewerHeight = value;
    this.renderReactTree();
  }

  set omit(value: string[] | undefined) {
    this.props.omit = value;
    this.renderReactTree();
  }

  set fallbackTitle(value: string | undefined) {
    this.props.fallbackTitle = value;
    this.renderReactTree();
  }

  set theme(value: DemoTheme | undefined) {
    this.props.theme = value;
    this.renderReactTree();
  }

  private renderReactTree() {
    if (!this.reactRoot) return;
    this.reactRoot.render(<DemoApp {...this.props} />);
  }
}

if (!customElements.get("react-file-viewer-playground")) {
  customElements.define("react-file-viewer-playground", ReactFileViewerPlaygroundElement);
}
