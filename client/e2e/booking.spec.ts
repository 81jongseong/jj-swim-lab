import { test, expect } from '@playwright/test';

/**
 * 예약 시스템 E2E 테스트
 * 
 * 이 테스트는 다음을 검증합니다:
 * - 예약 생성 프로세스
 * - 예약 조회 및 수정
 * - 예약 취소
 * - 예약 가능 시간 확인
 * - 권한 기반 예약 관리
 */

test.describe('예약 시스템', () => {
  test.beforeEach(async ({ page }) => {
    // 각 테스트 전에 로그인
    await page.goto('/');
    await page.click('text=로그인');
    await page.fill('input[type="email"]', 'student@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // 대시보드로 이동
    await expect(page).toHaveURL('/dashboard');
  });

  test.describe('예약 생성', () => {
    test('새 예약을 생성할 수 있어야 함', async ({ page }) => {
      // 예약 페이지로 이동
      await page.click('text=예약');
      await expect(page).toHaveURL(/.*booking/);
      
      // 예약 생성 버튼 클릭
      await page.click('[data-testid="create-booking"]');
      
      // 예약 폼 작성
      await page.fill('input[name="date"]', '2024-12-25');
      await page.selectOption('select[name="startTime"]', '10:00');
      await page.selectOption('select[name="endTime"]', '11:00');
      await page.selectOption('select[name="laneNumber"]', '1');
      await page.selectOption('select[name="purpose"]', 'practice');
      await page.fill('textarea[name="notes"]', '개인 연습 예약');
      
      // 예약 생성 버튼 클릭
      await page.click('button[type="submit"]');
      
      // 성공 메시지 확인
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="success-message"]')).toContainText('예약이 생성되었습니다');
      
      // 예약 목록에 새 예약이 표시되는지 확인
      await expect(page.locator('[data-testid="booking-list"]')).toBeVisible();
      await expect(page.locator('text=2024-12-25')).toBeVisible();
    });

    test('중복 시간 예약 시 에러가 표시되어야 함', async ({ page }) => {
      // 예약 페이지로 이동
      await page.click('text=예약');
      
      // 첫 번째 예약 생성
      await page.click('[data-testid="create-booking"]');
      await page.fill('input[name="date"]', '2024-12-25');
      await page.selectOption('select[name="startTime"]', '10:00');
      await page.selectOption('select[name="endTime"]', '11:00');
      await page.selectOption('select[name="laneNumber"]', '1');
      await page.click('button[type="submit"]');
      
      // 두 번째 예약 생성 (같은 시간)
      await page.click('[data-testid="create-booking"]');
      await page.fill('input[name="date"]', '2024-12-25');
      await page.selectOption('select[name="startTime"]', '10:30');
      await page.selectOption('select[name="endTime"]', '11:30');
      await page.selectOption('select[name="laneNumber"]', '1');
      await page.click('button[type="submit"]');
      
      // 에러 메시지 확인
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-message"]')).toContainText('해당 시간에 이미 예약이 있습니다');
    });

    test('과거 날짜 예약 시 에러가 표시되어야 함', async ({ page }) => {
      // 예약 페이지로 이동
      await page.click('text=예약');
      
      // 과거 날짜로 예약 시도
      await page.click('[data-testid="create-booking"]');
      await page.fill('input[name="date"]', '2020-01-01');
      await page.selectOption('select[name="startTime"]', '10:00');
      await page.selectOption('select[name="endTime"]', '11:00');
      await page.selectOption('select[name="laneNumber"]', '1');
      await page.click('button[type="submit"]');
      
      // 에러 메시지 확인
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-message"]')).toContainText('과거 날짜는 예약할 수 없습니다');
    });
  });

  test.describe('예약 조회 및 수정', () => {
    test('예약 목록을 조회할 수 있어야 함', async ({ page }) => {
      // 예약 페이지로 이동
      await page.click('text=예약');
      
      // 예약 목록이 표시되는지 확인
      await expect(page.locator('[data-testid="booking-list"]')).toBeVisible();
      
      // 예약 항목들이 표시되는지 확인
      const bookingItems = page.locator('[data-testid="booking-item"]');
      expect(await bookingItems.count()).toBeGreaterThan(0);
      
      // 각 예약 항목에 필요한 정보가 표시되는지 확인
      const firstBooking = bookingItems.first();
      await expect(firstBooking.locator('[data-testid="booking-date"]')).toBeVisible();
      await expect(firstBooking.locator('[data-testid="booking-time"]')).toBeVisible();
      await expect(firstBooking.locator('[data-testid="booking-lane"]')).toBeVisible();
    });

    test('예약을 수정할 수 있어야 함', async ({ page }) => {
      // 예약 페이지로 이동
      await page.click('text=예약');
      
      // 첫 번째 예약의 수정 버튼 클릭
      const firstBooking = page.locator('[data-testid="booking-item"]').first();
      await firstBooking.locator('[data-testid="edit-booking"]').click();
      
      // 수정 폼이 표시되는지 확인
      await expect(page.locator('[data-testid="edit-booking-form"]')).toBeVisible();
      
      // 예약 정보 수정
      await page.fill('textarea[name="notes"]', '수정된 예약 메모');
      
      // 수정 완료 버튼 클릭
      await page.click('button[type="submit"]');
      
      // 성공 메시지 확인
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="success-message"]')).toContainText('예약이 수정되었습니다');
    });

    test('다른 사용자의 예약은 수정할 수 없어야 함', async ({ page }) => {
      // 예약 페이지로 이동
      await page.click('text=예약');
      
      // 다른 사용자의 예약 항목 찾기
      const otherUserBooking = page.locator('[data-testid="other-user-booking"]').first();
      
      // 수정 버튼이 비활성화되어 있거나 표시되지 않는지 확인
      await expect(otherUserBooking.locator('[data-testid="edit-booking"]')).not.toBeVisible();
    });
  });

  test.describe('예약 취소', () => {
    test('자신의 예약을 취소할 수 있어야 함', async ({ page }) => {
      // 예약 페이지로 이동
      await page.click('text=예약');
      
      // 첫 번째 예약의 취소 버튼 클릭
      const firstBooking = page.locator('[data-testid="booking-item"]').first();
      await firstBooking.locator('[data-testid="cancel-booking"]').click();
      
      // 취소 확인 모달이 표시되는지 확인
      await expect(page.locator('[data-testid="cancel-confirmation-modal"]')).toBeVisible();
      
      // 취소 확인 버튼 클릭
      await page.click('[data-testid="confirm-cancel"]');
      
      // 성공 메시지 확인
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="success-message"]')).toContainText('예약이 취소되었습니다');
      
      // 예약 상태가 취소됨으로 변경되었는지 확인
      await expect(firstBooking.locator('[data-testid="booking-status"]')).toContainText('취소됨');
    });

    test('취소 확인 모달에서 취소를 거부할 수 있어야 함', async ({ page }) => {
      // 예약 페이지로 이동
      await page.click('text=예약');
      
      // 첫 번째 예약의 취소 버튼 클릭
      const firstBooking = page.locator('[data-testid="booking-item"]').first();
      await firstBooking.locator('[data-testid="cancel-booking"]').click();
      
      // 취소 확인 모달이 표시되는지 확인
      await expect(page.locator('[data-testid="cancel-confirmation-modal"]')).toBeVisible();
      
      // 취소 거부 버튼 클릭
      await page.click('[data-testid="cancel-cancel"]');
      
      // 모달이 닫히는지 확인
      await expect(page.locator('[data-testid="cancel-confirmation-modal"]')).not.toBeVisible();
      
      // 예약 상태가 변경되지 않았는지 확인
      await expect(firstBooking.locator('[data-testid="booking-status"]')).not.toContainText('취소됨');
    });
  });

  test.describe('예약 가능 시간 확인', () => {
    test('예약 가능한 시간을 조회할 수 있어야 함', async ({ page }) => {
      // 예약 페이지로 이동
      await page.click('text=예약');
      
      // 날짜 선택
      await page.fill('input[name="checkDate"]', '2024-12-25');
      await page.click('[data-testid="check-availability"]');
      
      // 예약 가능 시간 목록이 표시되는지 확인
      await expect(page.locator('[data-testid="available-slots"]')).toBeVisible();
      
      // 예약 가능한 시간 슬롯들이 표시되는지 확인
      const availableSlots = page.locator('[data-testid="available-slot"]');
      expect(await availableSlots.count()).toBeGreaterThan(0);
      
      // 각 슬롯에 시간 정보가 표시되는지 확인
      const firstSlot = availableSlots.first();
      await expect(firstSlot.locator('[data-testid="slot-time"]')).toBeVisible();
      await expect(firstSlot.locator('[data-testid="slot-lane"]')).toBeVisible();
    });

    test('예약된 시간은 예약 불가능으로 표시되어야 함', async ({ page }) => {
      // 예약 페이지로 이동
      await page.click('text=예약');
      
      // 날짜 선택
      await page.fill('input[name="checkDate"]', '2024-12-25');
      await page.click('[data-testid="check-availability"]');
      
      // 예약된 시간 슬롯이 비활성화되어 있는지 확인
      const bookedSlots = page.locator('[data-testid="booked-slot"]');
      expect(await bookedSlots.count()).toBeGreaterThan(0);
      
      // 예약된 슬롯이 클릭할 수 없는지 확인
      const firstBookedSlot = bookedSlots.first();
      await expect(firstBookedSlot).toHaveClass(/disabled/);
    });
  });

  test.describe('권한 기반 예약 관리', () => {
    test('강사는 자신의 강습 예약을 관리할 수 있어야 함', async ({ page }) => {
      // 강사로 로그인
      await page.click('text=로그아웃');
      await page.click('text=로그인');
      await page.fill('input[type="email"]', 'instructor@example.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      
      // 강습 관리 페이지로 이동
      await page.click('text=강습 관리');
      
      // 강습 예약 목록이 표시되는지 확인
      await expect(page.locator('[data-testid="instructor-bookings"]')).toBeVisible();
      
      // 예약 승인/거부 버튼이 표시되는지 확인
      const bookingItems = page.locator('[data-testid="booking-item"]');
      const firstBooking = bookingItems.first();
      await expect(firstBooking.locator('[data-testid="approve-booking"]')).toBeVisible();
      await expect(firstBooking.locator('[data-testid="reject-booking"]')).toBeVisible();
    });

    test('관리자는 모든 예약을 관리할 수 있어야 함', async ({ page }) => {
      // 관리자로 로그인
      await page.click('text=로그아웃');
      await page.click('text=로그인');
      await page.fill('input[type="email"]', 'admin@example.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      
      // 관리자 예약 관리 페이지로 이동
      await page.click('text=예약 관리');
      
      // 모든 예약 목록이 표시되는지 확인
      await expect(page.locator('[data-testid="all-bookings"]')).toBeVisible();
      
      // 예약 필터링 옵션이 표시되는지 확인
      await expect(page.locator('[data-testid="booking-filters"]')).toBeVisible();
      
      // 예약 통계가 표시되는지 확인
      await expect(page.locator('[data-testid="booking-stats"]')).toBeVisible();
    });
  });
});

