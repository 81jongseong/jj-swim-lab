/**
 * 🧪 JJ Swim Lab - Card 컴포넌트 테스트
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import Card from './../components/ui/Card';

describe('Card Component', () => {
  describe('기본 렌더링', () => {
    it('기본 카드를 렌더링해야 함', () => {
      render(<Card>테스트 카드 내용</Card>);
      
      const card = screen.getByText('테스트 카드 내용');
      expect(card).toBeInTheDocument();
    });

    it('커스텀 클래스명을 적용해야 함', () => {
      render(<Card className="custom-class">테스트 카드</Card>);
      
      const card = screen.getByText('테스트 카드');
      expect(card).toHaveClass('custom-class');
    });
  });

  describe('접근성', () => {
    it('role 속성을 지원해야 함', () => {
      render(<Card role="article">접근성 카드</Card>);
      
      const card = screen.getByRole('article');
      expect(card).toBeInTheDocument();
    });

    it('aria-label 속성을 지원해야 함', () => {
      render(<Card aria-label="정보 카드">카드 내용</Card>);
      
      const card = screen.getByLabelText('정보 카드');
      expect(card).toBeInTheDocument();
    });
  });

  describe('추가 props', () => {
    it('id 속성을 지원해야 함', () => {
      render(<Card id="test-card">카드 내용</Card>);
      
      const card = screen.getByText('카드 내용');
      expect(card).toHaveAttribute('id', 'test-card');
    });

    it('onClick 이벤트를 지원해야 함', () => {
      const handleClick = jest.fn();
      render(<Card onClick={handleClick}>클릭 가능한 카드</Card>);
      
      const card = screen.getByText('클릭 가능한 카드');
      card.click();
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('내용 렌더링', () => {
    it('React 요소를 자식으로 렌더링해야 함', () => {
      render(
        <Card>
          <div data-testid="child-element">자식 요소</div>
          <button data-testid="child-button">버튼</button>
        </Card>
      );
      
      const childElement = screen.getByTestId('child-element');
      const childButton = screen.getByTestId('child-button');
      
      expect(childElement).toBeInTheDocument();
      expect(childButton).toBeInTheDocument();
    });

    it('복잡한 JSX 구조를 렌더링해야 함', () => {
      render(
        <Card>
          <div data-testid="user-info">
            <h4>사용자 이름</h4>
            <p>사용자 설명</p>
            <ul>
              <li>항목 1</li>
              <li>항목 2</li>
            </ul>
          </div>
        </Card>
      );
      
      const userInfo = screen.getByTestId('user-info');
      expect(userInfo).toBeInTheDocument();
      expect(screen.getByText('사용자 이름')).toBeInTheDocument();
      expect(screen.getByText('사용자 설명')).toBeInTheDocument();
      expect(screen.getByText('항목 1')).toBeInTheDocument();
      expect(screen.getByText('항목 2')).toBeInTheDocument();
    });
  });
});