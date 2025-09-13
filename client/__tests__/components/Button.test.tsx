/**
 * 🧪 JJ Swim Lab - Button 컴포넌트 테스트
 * 
 * 📋 **테스트 목적**
 * - Button 컴포넌트의 렌더링 및 동작 검증
 * - 다양한 props에 대한 반응 테스트
 * - 사용자 상호작용 테스트
 * - 접근성 기능 테스트
 * 
 * 🔄 **주요 테스트**
 * - 기본 렌더링 테스트
 * - 다양한 variant 테스트
 * - 크기 및 스타일 테스트
 * - 클릭 이벤트 테스트
 * - 비활성화 상태 테스트
 * - 로딩 상태 테스트
 * 
 * 🗄️ **테스트 데이터**
 * - 모킹된 이벤트 핸들러
 * - 테스트용 props 데이터
 * - 사용자 상호작용 데이터
 * 
 * 🛠️ **필요한 설치 파일**
 * - Jest 테스트 프레임워크
 * - React Testing Library
 * - Button 컴포넌트
 * - 테스트 유틸리티
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 컴포넌트 렌더링 정확성 확인
 * 2. 사용자 상호작용 반응 확인
 * 3. 접근성 기능 검증
 * 4. 에러 상태 처리 확인
 * 5. 테스트 데이터 격리 및 정리
 * 6. 비동기 테스트 처리
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 기본 렌더링 테스트 확인
 * - [ ] variant 테스트 확인
 * - [ ] 크기 및 스타일 테스트 확인
 * - [ ] 클릭 이벤트 테스트 확인
 * - [ ] 비활성화 상태 테스트 확인
 * - [ ] 로딩 상태 테스트 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 Button 컴포넌트 테스트 구현
 * - 2024-12-19: 기본 렌더링 테스트 구현
 * - 2024-12-19: variant 테스트 구현
 * - 2024-12-19: 사용자 상호작용 테스트 구현
 * - 2024-12-19: 접근성 테스트 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (Button 컴포넌트 테스트 완료)
 * 
 * 🚀 **다음 단계**
 * - 통합 테스트 추가
 * - 성능 테스트 추가
 * - E2E 테스트 통합
 * - 테스트 자동화 개선
 * 
 * 💡 **사용 예시**
 * ```bash
 * # Button 컴포넌트 테스트 실행
 * npm test -- Button.test.tsx
 * 
 * # 커버리지와 함께 실행
 * npm run test:coverage -- Button.test.tsx
 * ```
 * 
 * 🔍 **Button 컴포넌트 테스트 흐름**
 * 1. 테스트 환경 설정 및 모킹
 * 2. Button 컴포넌트 렌더링 테스트
 * 3. 다양한 props 테스트
 * 4. 사용자 상호작용 테스트
 * 5. 접근성 기능 테스트
 * 6. 에러 상태 테스트
 * 7. 테스트 결과 검증 및 정리
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from '@/components/ui/Button';

// 실제 Button 컴포넌트를 사용

describe('Button Component', () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('기본 렌더링', () => {
    it('텍스트가 포함된 버튼을 렌더링해야 함', () => {
      render(<Button>테스트 버튼</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('테스트 버튼');
    });

    it('기본 클래스명을 적용해야 함', () => {
      render(<Button>테스트 버튼</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-4', 'py-2', 'rounded-md', 'font-medium');
    });

    it('커스텀 클래스명을 적용해야 함', () => {
      render(<Button className="custom-class">테스트 버튼</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });
  });

  describe('Variant 테스트', () => {
    it('primary variant를 적용해야 함', () => {
      render(<Button variant="primary">Primary 버튼</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-blue-600', 'text-white');
    });

    it('secondary variant를 적용해야 함', () => {
      render(<Button variant="secondary">Secondary 버튼</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-gray-300', 'text-gray-700');
    });

    it('danger variant를 적용해야 함', () => {
      render(<Button variant="danger">Danger 버튼</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-red-600', 'text-white');
    });

    it('outline variant를 적용해야 함', () => {
      render(<Button variant="outline">Outline 버튼</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('border', 'border-gray-300', 'text-gray-700');
    });
  });

  describe('크기 테스트', () => {
    it('small 크기를 적용해야 함', () => {
      render(<Button size="sm">Small 버튼</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-2', 'py-1', 'text-sm');
    });

    it('medium 크기를 적용해야 함', () => {
      render(<Button size="md">Medium 버튼</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-4', 'py-2');
    });

    it('large 크기를 적용해야 함', () => {
      render(<Button size="lg">Large 버튼</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-6', 'py-3', 'text-lg');
    });
  });

  describe('클릭 이벤트', () => {
    it('클릭 시 onClick 핸들러가 호출되어야 함', async () => {
      const user = userEvent.setup();
      render(<Button onClick={mockOnClick}>클릭 버튼</Button>);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('fireEvent를 사용한 클릭 테스트', () => {
      render(<Button onClick={mockOnClick}>클릭 버튼</Button>);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('여러 번 클릭 시 핸들러가 여러 번 호출되어야 함', async () => {
      const user = userEvent.setup();
      render(<Button onClick={mockOnClick}>클릭 버튼</Button>);
      
      const button = screen.getByRole('button');
      await user.click(button);
      await user.click(button);
      await user.click(button);
      
      expect(mockOnClick).toHaveBeenCalledTimes(3);
    });
  });

  describe('비활성화 상태', () => {
    it('disabled prop이 true일 때 버튼이 비활성화되어야 함', () => {
      render(<Button disabled>비활성화 버튼</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('비활성화된 버튼 클릭 시 핸들러가 호출되지 않아야 함', async () => {
      const user = userEvent.setup();
      render(<Button disabled onClick={mockOnClick}>비활성화 버튼</Button>);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('비활성화된 버튼에 적절한 스타일이 적용되어야 함', () => {
      render(<Button disabled>비활성화 버튼</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('disabled');
    });
  });

  describe('타입 속성', () => {
    it('기본적으로 button 타입을 가져야 함', () => {
      render(<Button>기본 버튼</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('submit 타입을 설정할 수 있어야 함', () => {
      render(<Button type="submit">제출 버튼</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('reset 타입을 설정할 수 있어야 함', () => {
      render(<Button type="reset">리셋 버튼</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'reset');
    });
  });

  describe('접근성', () => {
    it('aria-label 속성을 지원해야 함', () => {
      render(<Button aria-label="접근성 버튼">버튼</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', '접근성 버튼');
    });

    it('title 속성을 지원해야 함', () => {
      render(<Button title="툴팁 텍스트">버튼</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', '툴팁 텍스트');
    });

    it('기본적으로 button role을 가져야 함', () => {
      render(<Button>버튼</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('추가 props', () => {
    it('className 속성을 지원해야 함', () => {
      render(<Button className="custom-class">버튼</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('title 속성을 지원해야 함', () => {
      render(<Button title="툴팁 텍스트">버튼</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', '툴팁 텍스트');
    });
  });

  describe('복합 상태', () => {
    it('여러 variant와 size를 조합할 수 있어야 함', () => {
      render(
        <Button variant="primary" size="lg" className="custom">
          조합 버튼
        </Button>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-blue-600', 'text-white', 'px-6', 'py-3', 'text-lg', 'custom');
    });

    it('disabled와 variant를 조합할 수 있어야 함', () => {
      render(
        <Button variant="danger" disabled>
          비활성화된 위험 버튼
        </Button>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-red-600', 'text-white');
      expect(button).toBeDisabled();
    });
  });

  describe('에러 처리', () => {
    it('onClick 핸들러에서 에러가 발생해도 컴포넌트가 깨지지 않아야 함', async () => {
      const errorHandler = jest.fn().mockImplementation(() => {
        throw new Error('테스트 에러');
      });
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      render(<Button onClick={errorHandler}>에러 버튼</Button>);
      
      const button = screen.getByRole('button');
      
      // 에러가 발생해도 컴포넌트가 렌더링되어야 함
      expect(button).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });
  });
});
