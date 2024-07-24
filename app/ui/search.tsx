'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
// 関数が実行される頻度を制限するライブラリ
import { useDebouncedCallback } from 'use-debounce';

/** 特定の請求書を検索 */
export default function Search({ placeholder }: { placeholder: string }) {
  // クライアントコンポーネントのため、クライアントからパラメータにアクセスする用途。そのためuseSearchParamsフックを使用する
  const searchParams = useSearchParams();
  /** 現在のパス */
  const pathname = usePathname();
  const { replace } = useRouter();

  // 入力した値を検知
  // ユーザーが入力を停止してから特定の時間 (300 ミリ秒) 経過後にのみ実行。
  // データベースに送信されるリクエストの数を減らし、リソースを節約できます。
  const handleSearch = useDebouncedCallback((term) => {
    const params = new URLSearchParams();
    params.set('page', '1');
    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }
    // 現在のpathからユーザーの検索データのparamsにURLを更新
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
        placeholder={placeholder}
        onChange={(e) => {
          handleSearch(e.target.value);
        }}
        // 状態管理をしていないのでvalueは使わない
        defaultValue={searchParams.get('query')?.toString()}
      />
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
}
