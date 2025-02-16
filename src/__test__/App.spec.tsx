import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect } from '@jest/globals';
import { ChakraProvider } from '@chakra-ui/react';

import App from '../App';
import { Record } from '../domain/record';

const mockGetAllRecords = jest
  .fn()
  .mockResolvedValue([new Record('1', 'Reactの学習1', 60), new Record('2', 'Reactの学習2', 60), new Record('3', 'Reactの学習3', 60)]);

jest.mock('../lib/todo', () => {
  return {
    GetAllRecords: () => mockGetAllRecords(),
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
