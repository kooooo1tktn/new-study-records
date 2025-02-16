import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect } from '@jest/globals';
import { ChakraProvider } from '@chakra-ui/react';
import userEvent from '@testing-library/user-event';

import App from '../App';
import { Record } from '../domain/record';

const mockGetAllRecords = jest
  .fn()
  .mockResolvedValue([new Record('1', 'Reactの学習1', 60), new Record('2', 'Reactの学習2', 60), new Record('3', 'Reactの学習3', 60)]);

jest.mock('../lib/todo', () => {
  return {
    GetAllRecords: () => mockGetAllRecords(),
    newRecord: jest.fn().mockResolvedValue(null),
  };
});

describe('App コンポーネント', () => {
  it('ローディング画面を見ることができる', async () => {
    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
  });
});

it('学習記録を見ることができる', async () => {
  render(
    <ChakraProvider>
      <App />
    </ChakraProvider>
  );
  await waitFor(() => screen.getByTestId('table'));
  const records = screen.getAllByRole('row');
  expect(records.length - 1).toBe(4);
});

it('新規登録ボタンがあることを確認', async () => {
  render(
    <ChakraProvider>
      <App />
    </ChakraProvider>
  );
  await waitFor(() => screen.getByTestId('table'));
  const newRecordButton = screen.getByRole('button', { name: '新規登録' });
  expect(newRecordButton).toBeInTheDocument();
});

it('タイトルがあることを確認', async () => {
  render(
    <ChakraProvider>
      <App />
    </ChakraProvider>
  );
  await waitFor(() => screen.getByTestId('table'));
  const title = screen.getByText('シン・学習記録アプリ');
  expect(title).toBeInTheDocument();
});

it('学習記録を登録できることを確認', async () => {
  const user = userEvent.setup();
  render(
    <ChakraProvider>
      <App />
    </ChakraProvider>
  );
  // テーブルが表示されるまで待機
  await waitFor(() => screen.getByTestId('table'));

  // 新規登録ボタンをクリック
  const newRecordButton = screen.getByRole('button', { name: '新規登録' });
  await user.click(newRecordButton);

  // フォームに値を入力
  const titleInput = screen.getByPlaceholderText('学習内容を入力');
  const timeInput = screen.getByPlaceholderText('0');
  await user.type(titleInput, 'Reactの学習');
  await user.type(timeInput, '60');

  // 登録ボタンをクリック
  const submitButton = screen.getByRole('button', { name: '登録' });
  await user.click(submitButton);

  // モーダルが閉じたことを確認
  await waitFor(() => {
    expect(screen.queryByText('新規登録', { selector: 'header' })).not.toBeInTheDocument();
  });
});
