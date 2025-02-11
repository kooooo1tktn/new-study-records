import { supabase } from '../utils/supabase';
import { Record } from '../domain/record';

// レコード取得処理
export async function GetAllRecords() {
  // supabaseからデータを取得
  const response = await supabase.from('study-record').select('*');
  if (response.error) {
    throw new Error(response.error.message);
  }
  // レスポンスデータをRecordクラスに変換
  const recordsData = response.data.map((todo) => {
    return new Record(todo.id, todo.title, todo.time);
  });
  return recordsData;
}

// 登録処理
export const newRecord = async (title: string, time: number) => {
  const { data, error } = await supabase.from('study-record').insert([{ title, time }]);
  if (error) throw error;
  return data;
};

// 削除処理
export const deleteRecord = async (id: string) => {
  const { error } = await supabase.from('study-record').delete().eq('id', id);
  if (error) throw error;
};
