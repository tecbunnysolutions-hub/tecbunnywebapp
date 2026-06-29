'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Download, 
  ArrowRight, 
  Plus, 
  Edit, 
  Trash2, 
  TrendingUp, 
  Activity, 
  FileText,
  Lock,
  Loader2,
  AlertCircle
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/lib/hooks';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';

interface Project {
  id: string;
  name: string;
  explanation: string;
  target_amount: number;
  amount_raised: number;
  motive: string;
  detailed_information: string;
  status: string;
  created_at: string;
}

export default function UpcomingProjectsPage() {
  const { user } = useAuth();
  const isSuperadmin = user?.role === 'superadmin';

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal / Slide-over State
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Admin CRUD Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [formId, setFormId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formExplanation, setFormExplanation] = useState('');
  const [formTargetAmount, setFormTargetAmount] = useState('');
  const [formAmountRaised, setFormAmountRaised] = useState('');
  const [formMotive, setFormMotive] = useState('');
  const [formDetailedInfo, setFormDetailedInfo] = useState('');
  const [formStatus, setFormStatus] = useState('Pipeline');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Confirm Dialog State
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/upcoming');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch projects');
      setProjects(data.projects || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormId(null);
    setFormName('');
    setFormExplanation('');
    setFormTargetAmount('');
    setFormAmountRaised('');
    setFormMotive('');
    setFormDetailedInfo('');
    setFormStatus('Pipeline');
  };

  const handleOpenCreate = () => {
    resetForm();
    setFormMode('create');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click triggering details
    setFormId(project.id);
    setFormName(project.name);
    setFormExplanation(project.explanation);
    setFormTargetAmount(String(project.target_amount));
    setFormAmountRaised(String(project.amount_raised));
    setFormMotive(project.motive);
    setFormDetailedInfo(project.detailed_information);
    setFormStatus(project.status);
    setFormMode('edit');
    setIsFormOpen(true);
  };

  const handleOpenDelete = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setProjectToDelete(project);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formExplanation || !formTargetAmount || !formMotive || !formDetailedInfo) {
      toast.error('All fields except Amount Raised are required');
      return;
    }

    try {
      setIsSubmitting(true);
      const url = formMode === 'create' ? '/api/upcoming' : `/api/upcoming/${formId}`;
      const method = formMode === 'create' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          explanation: formExplanation,
          target_amount: Number(formTargetAmount),
          amount_raised: Number(formAmountRaised || 0),
          motive: formMotive,
          detailed_information: formDetailedInfo,
          status: formStatus
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save project');

      toast.success(formMode === 'create' ? 'Project created successfully' : 'Project updated successfully');
      setIsFormOpen(false);
      fetchProjects();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!projectToDelete) return;
    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/upcoming/${projectToDelete.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete project');

      toast.success('Project deleted successfully');
      setProjectToDelete(null);
      // Close detail panel if the deleted project was open
      if (selectedProject?.id === projectToDelete.id) {
        setIsDetailOpen(false);
      }
      fetchProjects();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDetail = (project: Project) => {
    setSelectedProject(project);
    setIsDetailOpen(true);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="relative min-h-screen bg-[#09090B] text-zinc-200 selection:bg-blue-500/20 selection:text-white overflow-hidden py-16 sm:py-24">
      <Toaster position="top-right" />

      {/* Background Noise and Grid */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute -left-40 top-0 h-[42rem] w-[42rem] rounded-full bg-blue-500/5 blur-[160px]" />
        <div className="absolute -right-40 top-1/3 h-[46rem] w-[46rem] rounded-full bg-indigo-500/5 blur-[180px]" />
      </div>

      <div className="mx-auto flex max-w-7xl flex-col gap-16 px-6 sm:px-8">
        
        {/* Page Hero */}
        <section className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/5 px-4.5 py-1.5 text-xs font-semibold text-blue-400">
            <Sparkles size={14} className="animate-pulse" />
            <span>Exclusive Investor Pipeline</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl font-tech leading-tight text-white">
            Upcoming <span className="bg-gradient-to-r from-blue-400 via-indigo-200 to-white bg-clip-text text-transparent">Ventures</span>
          </h1>
          <p className="text-lg font-light leading-relaxed text-zinc-400">
            Explore active pipeline developments, evaluate detailed strategic briefs, and securely download professional executive summaries.
          </p>

          {isSuperadmin && (
            <div className="flex justify-center pt-2">
              <Button onClick={handleOpenCreate} className="bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl px-6 py-2.5 flex items-center gap-2 transition-all">
                <Plus size={16} />
                <span>Add Pipeline Project</span>
              </Button>
            </div>
          )}
        </section>

        {/* Loading / Error States */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-sm text-zinc-400 font-light">Loading investor dashboard...</p>
          </div>
        ) : error ? (
          <div className="bento-card p-12 text-center max-w-md mx-auto space-y-4">
            <AlertCircle className="h-10 w-10 text-red-500 mx-auto" />
            <h3 className="text-lg font-bold font-tech text-white">System Sync Required</h3>
            <p className="text-sm text-zinc-400 font-light">
              The `upcoming_projects` table must be created in the Supabase database. Please apply the create DDL migration script.
            </p>
          </div>
        ) : projects.length === 0 ? (
          <div className="bento-card p-12 text-center max-w-md mx-auto">
            <FileText className="h-10 w-10 text-zinc-550 mx-auto mb-4" />
            <h3 className="text-lg font-bold font-tech text-white">No Ventures Active</h3>
            <p className="text-sm text-zinc-400 font-light mt-2">
              There are currently no active pipeline projects in the system database. Check back later.
            </p>
          </div>
        ) : (
          /* Projects Grid */
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <div 
                key={project.id}
                onClick={() => handleOpenDetail(project)}
                className="bento-card p-6 flex flex-col justify-between group cursor-pointer hover:border-blue-500/30 transition-all duration-300 relative"
              >
                {/* Superadmin Quick Overlay Actions */}
                {isSuperadmin && (
                  <div className="absolute top-4 right-4 flex gap-2 z-20">
                    <button 
                      onClick={(e) => handleOpenEdit(project, e)}
                      className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
                      title="Edit Project"
                    >
                      <Edit size={14} />
                    </button>
                    <button 
                      onClick={(e) => handleOpenDelete(project, e)}
                      className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-red-400 hover:text-red-300 hover:border-zinc-700 transition-colors"
                      title="Delete Project"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full px-2.5 py-0.5">
                      {project.status}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold font-tech text-white group-hover:text-blue-400 transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-xs leading-relaxed text-zinc-400 line-clamp-3">
                    {project.explanation}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-zinc-900/60 flex flex-col gap-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-550">Target Capital</span>
                    <span className="text-lg font-mono font-bold text-white">
                      {formatCurrency(project.target_amount)}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      className="flex-1 text-[11px] h-9 border-zinc-800 hover:bg-zinc-900 hover:text-white font-semibold rounded-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDetail(project);
                      }}
                    >
                      View Brief
                    </Button>
                    <Button 
                      asChild
                      className="flex-1 text-[11px] h-9 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg flex items-center justify-center gap-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <a href={`/api/upcoming/${project.id}/pdf`} download>
                        <Download size={12} />
                        <span>Summary PDF</span>
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Slide-over Detail Panel */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="fixed right-0 top-0 h-full w-full max-w-xl border-l border-zinc-800 bg-zinc-950 p-8 shadow-2xl duration-300 translate-x-0 translate-y-0 left-auto top-0 !rounded-none flex flex-col overflow-y-auto">
          {selectedProject && (
            <div className="flex-1 flex flex-col justify-between h-full space-y-8 pt-4">
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full px-2.5 py-0.5">
                    {selectedProject.status}
                  </span>
                  <h2 className="text-2xl font-bold font-tech text-white mt-3">
                    {selectedProject.name}
                  </h2>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2.5 border-y border-zinc-900 py-5">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="text-zinc-450 font-light">Fundraising Target Progress</span>
                    <span className="font-mono font-semibold text-white">
                      {formatCurrency(selectedProject.amount_raised)} / {formatCurrency(selectedProject.target_amount)}
                    </span>
                  </div>
                  
                  {(() => {
                    const percent = Math.min(100, Math.round((Number(selectedProject.amount_raised) / Number(selectedProject.target_amount)) * 100)) || 0;
                    return (
                      <div className="space-y-1.5">
                        <div className="w-full bg-zinc-900 rounded-full h-2.5 overflow-hidden">
                          <div className="bg-gradient-to-r from-blue-600 to-indigo-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${percent}%` }}></div>
                        </div>
                        <div className="text-[10px] text-right text-zinc-500 font-semibold">{percent}% Secured</div>
                      </div>
                    );
                  })()}
                </div>

                {/* Strategic Motive */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400">Strategic Motive</h3>
                  <p className="text-sm text-zinc-300 leading-relaxed font-light">
                    {selectedProject.motive}
                  </p>
                </div>

                {/* Detailed Information (HTML Rendered) */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400">Detailed Specifications</h3>
                  <div 
                    className="text-sm text-zinc-350 leading-relaxed font-light space-y-4 prose prose-invert max-w-none 
                      prose-h3:text-white prose-h3:font-tech prose-h3:mt-4 prose-h3:text-sm prose-h3:uppercase prose-h3:tracking-wider
                      prose-ul:list-disc prose-ul:pl-5 prose-ul:space-y-1.5 prose-li:text-zinc-300"
                    dangerouslySetInnerHTML={{ __html: selectedProject.detailed_information }}
                  />
                </div>
              </div>

              <div className="pt-8 border-t border-zinc-900 flex gap-3 z-10 bg-zinc-950 sticky bottom-0">
                <Button 
                  asChild
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl h-11 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10"
                >
                  <a href={`/api/upcoming/${selectedProject.id}/pdf`} download>
                    <Download size={16} />
                    <span>Download Executive PDF</span>
                  </a>
                </Button>
                
                {isSuperadmin && (
                  <Button 
                    variant="outline"
                    className="border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-white rounded-xl h-11 px-4"
                    onClick={(e) => handleOpenEdit(selectedProject, e)}
                  >
                    <Edit size={16} />
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Admin CRUD Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-zinc-800 bg-zinc-900 text-zinc-100">
          <DialogHeader>
            <DialogTitle className="font-tech text-white">
              {formMode === 'create' ? 'Create Pipeline Venture' : 'Modify Pipeline Venture'}
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Fill in the specifications below. The Detailed Brief accepts standard HTML code tags for formatting headers and list elements.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5 pt-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400">Project Name</label>
              <Input 
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Project Orion Data Vault"
                className="bg-zinc-950 border-zinc-800 text-white rounded-lg focus-visible:ring-blue-500"
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400">Target Capital (USD)</label>
                <Input 
                  type="number"
                  value={formTargetAmount}
                  onChange={(e) => setFormTargetAmount(e.target.value)}
                  placeholder="e.g. 500000"
                  className="bg-zinc-950 border-zinc-800 text-white rounded-lg"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400">Amount Raised (USD)</label>
                <Input 
                  type="number"
                  value={formAmountRaised}
                  onChange={(e) => setFormAmountRaised(e.target.value)}
                  placeholder="e.g. 150000"
                  className="bg-zinc-950 border-zinc-800 text-white rounded-lg"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400">Funding Status</label>
                <select 
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <option value="Pipeline">Pipeline</option>
                  <option value="Seeking Capital">Seeking Capital</option>
                  <option value="Secured">Secured</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400">Brief Explanation</label>
              <Textarea 
                value={formExplanation}
                onChange={(e) => setFormExplanation(e.target.value)}
                placeholder="Truncated on overview card. Focus on core objectives."
                className="bg-zinc-950 border-zinc-800 text-white rounded-lg min-h-[80px]"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400">Strategic Motive</label>
              <Textarea 
                value={formMotive}
                onChange={(e) => setFormMotive(e.target.value)}
                placeholder="Why are we building this? Strategic significance to partners."
                className="bg-zinc-950 border-zinc-800 text-white rounded-lg min-h-[80px]"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400">
                Detailed Brief Specifications (HTML format)
              </label>
              <Textarea 
                value={formDetailedInfo}
                onChange={(e) => setFormDetailedInfo(e.target.value)}
                placeholder="<h3>Executive Summary</h3><p>Detailed analysis</p><ul><li>Specification 1</li></ul>"
                className="bg-zinc-950 border-zinc-800 text-white font-mono text-xs rounded-lg min-h-[160px]"
                required
              />
            </div>

            <DialogFooter className="pt-4 border-t border-zinc-800">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setIsFormOpen(false)}
                className="text-zinc-400 hover:text-white rounded-xl"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold px-6 shadow-md"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={projectToDelete !== null} onOpenChange={(open) => !open && setProjectToDelete(null)}>
        <DialogContent className="border-zinc-800 bg-zinc-900 text-zinc-100">
          <DialogHeader>
            <DialogTitle className="font-tech text-white">Remove Venture</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Are you sure you want to permanently remove **{projectToDelete?.name}** from the pipeline database? This action is irreversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4 flex gap-3">
            <Button 
              variant="ghost" 
              onClick={() => setProjectToDelete(null)}
              className="text-zinc-400 hover:text-white rounded-xl flex-1"
            >
              Cancel
            </Button>
            <Button 
              disabled={isSubmitting}
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-500 text-white rounded-xl font-semibold flex-1 flex items-center justify-center"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Permanently Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
