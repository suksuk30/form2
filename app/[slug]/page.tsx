import { headers } from 'next/headers';
import { getLandingComponent, type SlugData } from '@/lib/landing-templates';
import { getLandingMetadata } from '@/lib/landing-metadata';
import { resolveLandingContext, resolveMetadataTemplateId } from '@/lib/landing-slug-resolve';
import { Card, CardContent } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: {
    slug: string;
  };
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const requestHost = headers().get('host') ?? undefined;
  const context = await resolveLandingContext(params.slug);
  const templateId = resolveMetadataTemplateId(context);
  return getLandingMetadata(templateId, requestHost);
}

function NotFoundCard({ title, message }: { title: string; message: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-12">
      <Card className="bg-slate-800/50 border-slate-700 max-w-md w-full backdrop-blur-sm">
        <CardContent className="flex flex-col items-center py-16">
          <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center mb-6">
            <Shield className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">{title}</h2>
          <p className="text-slate-400 text-center">{message}</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default async function LandingPage({ params }: PageProps) {
  const context = await resolveLandingContext(params.slug);

  if (!context.slugValid) {
    return (
      <NotFoundCard
        title="404 - Halaman tidak ditemukan"
        message="Maaf, halaman tidak ditemukan."
      />
    );
  }

  if (!context.rpcData) {
    return (
      <NotFoundCard
        title="404 - Halaman tidak ditemukan"
        message="Maaf, halaman tidak ditemukan."
      />
    );
  }

  if (!context.landingValid) {
    return (
      <NotFoundCard
        title="Halaman Tidak Aktif"
        message="Maaf, akses ke halaman ini ditangguhkan."
      />
    );
  }

  const slugData: SlugData = {
    slug: context.slug!,
  };

  const LandingComponent = getLandingComponent(context.templateId);
  return <LandingComponent slugData={slugData} />;
}
