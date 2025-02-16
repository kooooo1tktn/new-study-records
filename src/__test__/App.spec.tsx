import { render, screen } from '@testing-library/react';
import { describe, it, expect } from '@jest/globals';
import { ChakraProvider } from '@chakra-ui/react';

import App from '../App';

describe('App コンポーネント', () => {
  it('ローディング画面を見ることができる', () => {
    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
  });
});
