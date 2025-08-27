import { NextRequest, NextResponse } from 'next/server';

// 임시 댓글 데이터 (실제로는 데이터베이스에서 가져와야 함)
let mockComments = [
  {
    _id: 'c1',
    postId: '1',
    content: '저도 처음에 호흡법이 어려웠어요. 팁은 물속에서 코로 부드럽게 숨을 내쉬는 거예요. 그리고 머리를 돌릴 때는 한 번에 돌리지 말고 자연스럽게 돌리세요!',
    author: { name: '수영고수', userId: 'expert001' },
    likes: 5,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: 'c2',
    postId: '1',
    content: '초보자라면 먼저 물속에서 숨 내쉬기 연습부터 하세요. 코로 부드럽게 거품을 내면서 연습하면 도움이 될 거예요.',
    author: { name: '코치김', userId: 'coach001' },
    likes: 3,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  },
  {
    _id: 'c3',
    postId: '2',
    content: '평영 팔 동작은 정말 중요해요! 팔을 앞으로 내밀 때는 손바닥이 아래를 향하게 하고, 뒤로 젖힐 때는 팔꿈치를 90도 정도로 구부리세요.',
    author: { name: '평영전문가', userId: 'breast_expert' },
    likes: 7,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: 'c4',
    postId: '2',
    content: '연습 순서는 1) 팔 앞으로 내밀기 2) 팔 벌리기 3) 팔 뒤로 젖히기 4) 팔 모으기 순서로 하시면 됩니다.',
    author: { name: '수영강사', userId: 'instructor001' },
    likes: 4,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
  }
];

// GET: 특정 게시글의 댓글 목록 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const postComments = mockComments.filter(c => c.postId === id);

    // 최신순 정렬
    postComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      success: true,
      comments: postComments,
      total: postComments.length
    });

  } catch (error) {
    console.error('댓글 조회 실패:', error);
    return NextResponse.json(
      { success: false, error: '댓글을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

// POST: 새 댓글 작성
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { success: false, error: '댓글 내용을 입력해주세요.' },
        { status: 400 }
      );
    }

    // 새 댓글 생성
    const newComment = {
      _id: `c${Date.now()}`,
      postId: id,
      content: content.trim(),
      author: { name: '사용자', userId: 'user001' }, // 실제로는 인증된 사용자 정보
      likes: 0,
      createdAt: new Date().toISOString()
    };

    mockComments.push(newComment);

    return NextResponse.json({
      success: true,
      comment: newComment,
      message: '댓글이 성공적으로 등록되었습니다.'
    }, { status: 201 });

  } catch (error) {
    console.error('댓글 작성 실패:', error);
    return NextResponse.json(
      { success: false, error: '댓글 작성에 실패했습니다.' },
      { status: 500 }
    );
  }
}
