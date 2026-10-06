export function ComingSoon({ title }: { title?: string }) {
  return (
    <div className="p-8 max-w-[1400px] mx-auto text-center py-20">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{title || 'Coming Soon'}</h2>
      <p className="text-sm text-gray-500">This module is under development.</p>
    </div>
  );
}
