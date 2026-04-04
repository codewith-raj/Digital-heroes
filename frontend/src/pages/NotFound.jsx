import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-lg"
      >
        <div className="text-8xl font-bold font-display gradient-text mb-4">404</div>
        <h1 className="text-3xl font-bold font-display text-white mb-3">Page Not Found</h1>
        <p className="text-slate-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/" className="btn-primary">
            <Home className="w-4 h-4" /> Go Home
          </Link>
          <button onClick={() => window.history.back()} className="btn-secondary">
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
        </div>
      </motion.div>
    </div>
  );
}
