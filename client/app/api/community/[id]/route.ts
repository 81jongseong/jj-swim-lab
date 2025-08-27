import { NextRequest, NextResponse } from 'next/server';

// 임시 데이터 (실제로는 데이터베이스에서 가져와야 함)
let mockPosts = [
  {
    _id: '1',
    title: '자유형 기초 퀴즈',
    description: '자유형의 기본기를 테스트하는 퀴즈입니다.',
    content: '안녕하세요! 수영 초보자인데 자유형을 배우고 있어요. 호흡법이 어려운데 팁이 있을까요? 특히 물속에서 숨을 내쉬는 타이밍이 잘 안 맞아요. 경험 많은 분들의 조언 부탁드립니다!',
    category: '자유형',
    type: 'multiple',
    author: { name: '김수영', userId: 'swimmer001' },
    tags: ['초보자', '자유형', '호흡법'],
    timeLimit: 30,
    passingScore: 70,
    isActive: true,
    likes: 12,
    comments: 8,
    views: 156,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: '2',
    title: '평영 팔 동작 질문',
    description: '평영 팔 동작에 대한 궁금증이 있어요.',
    content: '평영을 배우고 있는데 팔 동작이 너무 복잡해요. 특히 팔을 앞으로 내밀 때와 뒤로 젖힐 때의 타이밍이 잘 안 맞아요. 어떤 순서로 연습하면 좋을까요? 그리고 팔꿈치를 구부리는 각도도 중요할까요?',
    category: '평영',
    type: 'essay',
    author: { name: '박평영', userId: 'breast001' },
    tags: ['평영', '팔동작', '테크닉'],
    timeLimit: 20,
    passingScore: 80,
    isActive: true,
    likes: 8,
    comments: 15,
    views: 89,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: '3',
    title: '수영장에서의 예절',
    description: '수영장 이용 시 지켜야 할 예절에 대해 공유해요.',
    content: '수영장을 이용하면서 느낀 점들을 공유하고 싶어요. 레인을 공유할 때는 오른쪽으로 수영하고, 추월할 때는 왼쪽으로 해야 한다는 걸 알게 됐어요. 그리고 레인 끝에서 잠깐 쉴 때는 구석에 붙어서 쉬는 게 좋다고 하더라고요. 다른 분들은 어떤 예절을 지키고 계신가요?',
    category: '기타',
    type: 'mixed',
    author: { name: '이예절', userId: 'manner001' },
    tags: ['예절', '레인공유', '수영장'],
    timeLimit: 15,
    passingScore: 60,
    isActive: true,
    likes: 25,
    comments: 32,
    views: 234,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

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
  }
];

// GET: 개별 게시글 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const post = mockPosts.find(p => p._id === id);

    if (!post) {
      return NextResponse.json(
        { success: false, error: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 조회수 증가
    post.views = (post.views || 0) + 1;

    return NextResponse.json({
      success: true,
      post
    });

  } catch (error) {
    console.error('게시글 조회 실패:', error);
    return NextResponse.json(
      { success: false, error: '게시글을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

// PUT: 게시글 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { title, content, category, tags } = body;

    const postIndex = mockPosts.findIndex(p => p._id === id);
    if (postIndex === -1) {
      return NextResponse.json(
        { success: false, error: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 게시글 업데이트
    mockPosts[postIndex] = {
      ...mockPosts[postIndex],
      title: title || mockPosts[postIndex].title,
      content: content || mockPosts[postIndex].content,
      category: category || mockPosts[postIndex].category,
      tags: tags || mockPosts[postIndex].tags
    };

    return NextResponse.json({
      success: true,
      post: mockPosts[postIndex],
      message: '게시글이 성공적으로 수정되었습니다.'
    });

  } catch (error) {
    console.error('게시글 수정 실패:', error);
    return NextResponse.json(
      { success: false, error: '게시글 수정에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE: 게시글 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const postIndex = mockPosts.findIndex(p => p._id === id);

    if (postIndex === -1) {
      return NextResponse.json(
        { success: false, error: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 게시글 삭제
    const deletedPost = mockPosts.splice(postIndex, 1)[0];

    // 관련 댓글도 삭제
    mockComments = mockComments.filter(c => c.postId !== id);

    return NextResponse.json({
      success: true,
      message: '게시글이 성공적으로 삭제되었습니다.',
      deletedPost
    });

  } catch (error) {
    console.error('게시글 삭제 실패:', error);
    return NextResponse.json(
      { success: false, error: '게시글 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
}
