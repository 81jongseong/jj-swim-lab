/**
 * 🏊‍♂️ JJ Swim Lab - 새로운 프로그램 생성기 페이지
 * 
 * 건강·질환·기술 기반 수영 프로그램 생성기
 * 랩 단위(25m/50m) 세트, 페이스/레스트/드릴/코칭큐까지 포함된 주간 계획 생성
 */

import PlannerForm from '../../../../components/PlannerForm';

export default function NewPlannerPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PlannerForm />
    </div>
  );
}
