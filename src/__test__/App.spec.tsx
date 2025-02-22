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
    deleteRecord: jest.fn().mockResolvedValue(null),
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
    const modalHeader = screen.queryByText('新規登録', { selector: 'header.chakra-modal__header' });
    expect(modalHeader).not.toBeInTheDocument();
  });
});

it('モーダルが「新規登録」というタイトルになっていることを確認', async () => {
  const user = userEvent.setup();
  render(
    <ChakraProvider>
      <App />
    </ChakraProvider>
  );
  await waitFor(() => screen.getByTestId('table'));
  const newRecordButton = screen.getByRole('button', { name: '新規登録' });
  await user.click(newRecordButton);
  const modalHeader = screen.getByText('新規登録', { selector: 'header.chakra-modal__header' });
  expect(modalHeader).toBeInTheDocument();
});

it('学習内容がない時に登録するとエラーが出ることを確認', async () => {
  const user = userEvent.setup();
  render(
    <ChakraProvider>
      <App />
    </ChakraProvider>
  );
  await waitFor(() => screen.getByTestId('table'));
  const newRecordButton = screen.getByRole('button', { name: '新規登録' });
  await user.click(newRecordButton);
  const submitButton = screen.getByRole('button', { name: '登録' });
  await user.click(submitButton);
  const errorMessage = screen.getByText('内容の入力は必須です');
  expect(errorMessage).toBeInTheDocument();
});

it('学習時間がない時に登録するとエラーが出ることを確認', async () => {
  const user = userEvent.setup();
  render(
    <ChakraProvider>
      <App />
    </ChakraProvider>
  );
  await waitFor(() => screen.getByTestId('table'));
  const newRecordButton = screen.getByRole('button', { name: '新規登録' });
  await user.click(newRecordButton);
  const titleInput = screen.getByPlaceholderText('学習内容を入力');
  await user.type(titleInput, 'Reactの学習');
  const submitButton = screen.getByRole('button', { name: '登録' });
  await user.click(submitButton);
  const errorMessage = screen.getByText('時間の入力は必須です');
  expect(errorMessage).toBeInTheDocument();
});

it('学習時間が0の時に登録するとエラーが出ることを確認', async () => {
  const user = userEvent.setup();
  render(
    <ChakraProvider>
      <App />
    </ChakraProvider>
  );
  await waitFor(() => screen.getByTestId('table'));
  const newRecordButton = screen.getByRole('button', { name: '新規登録' });
  await user.click(newRecordButton);
  const titleInput = screen.getByPlaceholderText('学習内容を入力');
  await user.type(titleInput, 'Reactの学習');
  const timeInput = screen.getByPlaceholderText('0');
  await user.type(timeInput, '0');
  const submitButton = screen.getByRole('button', { name: '登録' });
  await user.click(submitButton);
  const errorMessage = screen.getByText('時間は0以上である必要があります');
  expect(errorMessage).toBeInTheDocument();
});

it('学習記録を削除できることを確認', async () => {
  const user = userEvent.setup();
  render(
    <ChakraProvider>
      <App />
    </ChakraProvider>
  );
  await waitFor(() => screen.getByTestId('table'));
  const deleteButton = screen.getByTestId('delete-button-1');
  await user.click(deleteButton);
  await waitFor(() => {
    const records = screen.getAllByRole('row');
    expect(records.length - 2).toBe(2);
  });
});
