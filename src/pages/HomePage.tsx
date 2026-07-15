import { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiMoon,
  FiSun,
  FiBookOpen,
  FiShield,
  FiSettings,
  FiEdit,
  FiVideo,
  FiType,
  FiPenTool,
  FiBarChart2,
  FiArrowRight,
  FiPackage,
  FiLayers
} from 'react-icons/fi';
import { useAppStore } from '@/store/appStore';

interface Props {
  onTry: () => void;
}

export function HomePage({ onTry }: Props) {
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);

  // SEO Optimization
  useEffect(() => {
    document.title = "Turnly - Convert PDFs to Interactive 3D Publications";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        'content',
        'Turn static PDFs into stunning 3D interactive flipbooks. Add clickable hyper-links, embedded video players, highlight markers, text box comments, freehand pencil drawings, custom white-label branding, and local analytics tracking.'
      );
    }
  }, []);

  const handleLearnMore = () => {
    const featuresEl = document.getElementById('features-section');
    featuresEl?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 py-4 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-900/50">
        <div className="flex items-center gap-2 font-semibold text-lg">
          <FiBookOpen className="text-accent text-xl" />
          <span>Turnly</span>
        </div>
        <div className="flex items-center gap-6">
          <button
            onClick={onTry}
            className="text-sm font-medium hover:text-accent transition-colors"
          >
            Dashboard
          </button>
          <button
            onClick={handleLearnMore}
            className="text-sm font-medium hover:text-accent transition-colors hidden sm:inline"
          >
            Features
          </button>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="h-9 w-9 rounded-lg flex items-center justify-center hover:bg-slate-900/5 dark:hover:bg-white/10 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <FiSun className="text-lg" /> : <FiMoon className="text-lg" />}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 pt-24">
        <section className="px-6 py-20 max-w-5xl mx-auto text-center flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-6"
          >
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent dark:bg-accent/20">
              Web & Offline Interactive Publication Suite
            </span>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-3xl leading-tight">
              Transform standard PDFs into <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Interactive 3D Publications</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-500 dark:text-slate-400 max-w-2xl font-light">
              Annotate pages with hyperlinks, video embeddings, highlight rects, text notes, and vector drawing sketches. Fully customize branding logos, and export standalone offline PWA bundles.
            </p>
            <div className="flex flex-wrap gap-4 mt-4 justify-center">
              <button
                onClick={onTry}
                className="px-6 py-3 rounded-xl bg-accent text-white font-medium shadow-lg shadow-accent/25 hover:bg-accent/90 transition-all flex items-center gap-2 group"
              >
                <span>Try Now</span>
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={handleLearnMore}
                className="px-6 py-3 rounded-xl bg-slate-200/60 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-850 font-medium transition-all"
              >
                Learn More
              </button>
            </div>
          </motion.div>
        </section>

        {/* Features Grid Section */}
        <section id="features-section" className="py-20 bg-slate-100/50 dark:bg-slate-900/30 border-y border-slate-200/50 dark:border-slate-900/50">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">Loaded with Professional Publishing Features</h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
                Everything you need to compile, enrich, white-label, analyze, and package your documents.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={<FiLayers className="text-indigo-500" />}
                title="3D Book Physics Simulation"
                description="Model realistic curling, paper bending, cover styling, and shadow dynamics for desktop and tablet screens."
              />
              <FeatureCard
                icon={<FiEdit className="text-blue-500" />}
                title="Color Highlights"
                description="Draw highlight rectangles over paragraphs to draw user attention. Choose from multiple vibrant marker colors."
              />
              <FeatureCard
                icon={<FiPenTool className="text-yellow-500" />}
                title="Freehand Vector Sketches"
                description="Draw, sketch, or sign directly onto document pages. Auto-saves as responsive vector coordinates that scale beautifully."
              />
              <FeatureCard
                icon={<FiVideo className="text-red-500" />}
                title="Embedded Video Players"
                description="Drag bounding boxes anywhere on the page to display embedded YouTube video clips directly inside the layout."
              />
              <FeatureCard
                icon={<FiType className="text-green-500" />}
                title="Sticky TextBoxes"
                description="Place custom textual note comments or explanations over pages, fully customizing text colors and borders."
              />
              <FeatureCard
                icon={<FiSettings className="text-purple-500" />}
                title="White-Label Branding"
                description="Upload custom company brand logos and replace default copyrights with your custom footer white-label text."
              />
              <FeatureCard
                icon={<FiBarChart2 className="text-pink-500" />}
                title="Local Analytics & Telemetry"
                description="Register views, reading times, and link clicks inside a dashboard. Export details to spreadsheet CSV files."
              />
              <FeatureCard
                icon={<FiPackage className="text-cyan-500" />}
                title="Offline PWA Exports"
                description="Package your annotated publications with all configurations, logos, and custom styles into a downloadable offline ZIP."
              />
              <FeatureCard
                icon={<FiShield className="text-teal-500" />}
                title="100% Privacy & Local Storage"
                description="All processing occurs inside your browser. No files or analytics are ever uploaded to external servers."
              />
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">How It Works</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
              Convert, annotate, and compile your publications in three simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold text-lg">
                1
              </div>
              <h3 className="font-semibold text-lg">Upload PDF</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
                Upload your document to the dashboard. It converts and caches automatically inside your browser storage.
              </p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold text-lg">
                2
              </div>
              <h3 className="font-semibold text-lg">Annotate & Rebrand</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
                Draw overlay boxes to add multimedia or links, draw freehand vector sketches, and upload your business logo.
              </p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold text-lg">
                3
              </div>
              <h3 className="font-semibold text-lg">Export Offline ZIP</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
                Download a fully self-contained offline website folder ready to host, view, and share anywhere with zero dependencies.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-200 dark:border-slate-900 text-center text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-950">
        Designed and maintained by{' '}
        <a
          href="https://akainnovations.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:underline font-medium transition-all"
        >
          AKA Innovations
        </a>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="flex flex-col items-start gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 shadow-sm hover:shadow-md transition-shadow">
      <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center text-lg">
        {icon}
      </div>
      <h3 className="font-semibold text-base">{title}</h3>
      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
