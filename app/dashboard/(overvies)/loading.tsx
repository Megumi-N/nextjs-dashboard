import DashboardSkeleton from '@/app/ui/skeletons';

// ページコンテンツの読み込み中に代わりに表示されるフォールバックUIを作成できる。ストリーミング機能。
// (overviews)に配置することで、customersなどの同階層のものには反映されなくなる
export default function Loading() {
  return <DashboardSkeleton />;
}
