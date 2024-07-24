// ファイル内のすべてのエクスポートされた関数がサーバーアクションとして認識される
'use server';

// 型検証ライブラリ
import { z } from 'zod';
import { sql } from '@vercel/postgres';
// ユーザーのブラウザに一定期間保存するクライアントルータキャッシュ
// サーバーへのリクエスト数を減らしながら、ユーザーがルート間をすばやく移動できるようになります
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'please select a customer',
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'please select an invoice status',
  }),
  date: z.string(),
});

// omitで指定のフィールドを省略する
const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

// 作成
export async function createInvoice(prevState: State, formData: FormData) {
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }

  const { customerId, amount, status } = validatedFields.data;
  console.log(validatedFields.data);

  // 単位をセント単位にする
  const amountInCents = amount * 100;
  console.log(amount);
  // YYYY-MM-DDのdateを作成
  const date = new Date().toISOString().split('T')[0];
  // 複数のフィールドを持つ場合は以下の書き方
  // const rawFormData = Object.fromEntries(formData.entries())

  try {
    await sql`
  INSERT INTO invoices (customer_id, amount, status, date)
  VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
`;
  } catch (error) {
    return {
      message: 'Database Error: Failed to Create Invoice',
    };
  }

  // invoicesページに表示されるデータを更新するため、
  // このキャッシュをクリアしてサーバーへの新しいリクエストを行う。
  // databaseが更新されると、/dashboard/invoicesパスが再検証され、サーバーから最新のデータが取得される
  revalidatePath('/dashboard/invoices');

  // 送信後にリダイレクトされる
  redirect('/dashboard/invoices');
}

// 更新
export async function updateInvoice(
  id: string,
  prevState: State,
  formData: FormData
) {
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    };
  }

  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;

  try {
    await sql`
        UPDATE invoices
        SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
        WHERE id = ${id}
      `;
  } catch (error) {
    return { message: 'Database Error: Failed to Update Invoice.' };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

// 削除
export async function deleteInvoice(id: string) {
  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices');
    return { message: 'Deleted Invoice.' };
  } catch (error) {
    return { message: 'Database Error: Failed to Delete Invoice.' };
  }
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}
