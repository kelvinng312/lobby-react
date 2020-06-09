import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

describe('Chat body', () => {
  it('Chat body renders', () => {
    const { getByTestId } = render(<App />);
    const chatBody = getByTestId('chat-body');
    expect(chatBody).toBeInTheDocument();
  });
  it('Chat body has an empty ul child element', () => {
    const { getByTestId } = render(<App />);
    const chatBody = getByTestId('chat-body');
    const chatUl = getByTestId('chat-ul');
    expect(chatBody).toContainElement(chatUl);
    expect(chatUl.childElementCount).toBe(0);
  });
});

