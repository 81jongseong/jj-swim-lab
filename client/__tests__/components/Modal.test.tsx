/**
 * 🧪 JJ Swim Lab - Modal 컴포넌트 테스트
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Modal from './../components/ui/Modal';

describe('Modal Component', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // body overflow 스타일 초기화
    document.body.style.overflow = 'unset';
  });

  describe('기본 렌더링', () => {
    it('isOpen이 false일 때 렌더링되지 않아야 함', () => {
      render(
        <Modal isOpen={false} onClose={mockOnClose}>
          모달 내용
        </Modal>
      );
      
      const modal = screen.queryByText('모달 내용');
      expect(modal).not.toBeInTheDocument();
    });

    it('isOpen이 true일 때 렌더링되어야 함', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose}>
          모달 내용
        </Modal>
      );
      
      const modal = screen.getByText('모달 내용');
      expect(modal).toBeInTheDocument();
    });

    it('기본 크기를 적용해야 함', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose}>
          모달 내용
        </Modal>
      );
      
      const modal = screen.getByText('모달 내용');
      expect(modal).toHaveClass('max-w-md');
    });
  });

  describe('제목 표시', () => {
    it('제목을 렌더링해야 함', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="테스트 모달">
          모달 내용
        </Modal>
      );
      
      const title = screen.getByText('테스트 모달');
      expect(title).toBeInTheDocument();
      expect(title).toHaveClass('text-lg', 'font-semibold');
    });

    it('제목 없이 렌더링할 수 있어야 함', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose}>
          모달 내용
        </Modal>
      );
      
      const modal = screen.getByText('모달 내용');
      expect(modal).toBeInTheDocument();
    });
  });

  describe('크기 설정', () => {
    it('small 크기를 적용해야 함', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} size="sm">
          작은 모달
        </Modal>
      );
      
      const modal = screen.getByText('작은 모달');
      expect(modal).toHaveClass('max-w-sm');
    });

    it('large 크기를 적용해야 함', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} size="lg">
          큰 모달
        </Modal>
      );
      
      const modal = screen.getByText('큰 모달');
      expect(modal).toHaveClass('max-w-lg');
    });
  });

  describe('복잡한 내용', () => {
    it('React 요소를 자식으로 렌더링해야 함', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div data-testid="form-container">
            <form>
              <input type="text" placeholder="이름" data-testid="name-input" />
              <textarea placeholder="설명" data-testid="description-textarea" />
              <button type="submit" data-testid="submit-button">제출</button>
            </form>
          </div>
        </Modal>
      );
      
      const formContainer = screen.getByTestId('form-container');
      const nameInput = screen.getByTestId('name-input');
      const descriptionTextarea = screen.getByTestId('description-textarea');
      const submitButton = screen.getByTestId('submit-button');
      
      expect(formContainer).toBeInTheDocument();
      expect(nameInput).toBeInTheDocument();
      expect(descriptionTextarea).toBeInTheDocument();
      expect(submitButton).toBeInTheDocument();
    });

    it('중첩된 컴포넌트를 렌더링해야 함', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div data-testid="nested-content">
            <h3>섹션 제목</h3>
            <div data-testid="section-1">
              <p>첫 번째 섹션</p>
              <ul>
                <li>항목 1</li>
                <li>항목 2</li>
              </ul>
            </div>
            <div data-testid="section-2">
              <p>두 번째 섹션</p>
              <button>액션 버튼</button>
            </div>
          </div>
        </Modal>
      );
      
      const nestedContent = screen.getByTestId('nested-content');
      const section1 = screen.getByTestId('section-1');
      const section2 = screen.getByTestId('section-2');
      
      expect(nestedContent).toBeInTheDocument();
      expect(section1).toBeInTheDocument();
      expect(section2).toBeInTheDocument();
      expect(screen.getByText('섹션 제목')).toBeInTheDocument();
      expect(screen.getByText('첫 번째 섹션')).toBeInTheDocument();
      expect(screen.getByText('두 번째 섹션')).toBeInTheDocument();
    });
  });
});