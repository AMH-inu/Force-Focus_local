// 파일 위치: Force-Focus/desktop-agent/src/mocks/handlers.ts
import { http, HttpResponse } from 'msw';
import { v4 as uuidv4 } from 'uuid';

// --- 가짜 데이터 정의 ---
const mockDefaultProfile = {
  id: 'profile-default-desktop',
  user_id: 'desktop-user-123',
  profile_name: '데스크탑 기본 집중',
  is_default: true,
  model_type: 'time_sliced_rules',
  time_slices: [
    { slice_index: 0, rules: { typing_freq_min: 0.2, context_switch_max: 10 } },
    { slice_index: 1, rules: { typing_freq_min: 0.7, context_switch_max: 2 } },
    { slice_index: 2, rules: { typing_freq_min: 0.6, context_switch_max: 3 } },
  ],
  model_confidence_score: 0.92,
  last_updated_at: new Date().toISOString(),
  custom_thresholds: { global_sensitivity: 0.9 },
};

const mockCurrentUser = {
  id: 'desktop-user-123',
  email: 'desktop@example.com',
  username: 'desktopUser',
  settings: {
    notifications_enabled: true,
    dark_mode: false,
  },
  blocked_apps: ['slack.exe', 'discord.exe'],
};

// --- (추가) 가짜 할 일(Task) 데이터 정의 ---
let mockTasks = [
  {
    id: 'task-coding-session',
    user_id: 'desktop-user-123',
    task_name: 'FastAPI 백엔드 개발',
    description: 'API 계약서 기반 백엔드 로직 구현',
    due_date: '2024-12-31T23:59:59Z',
    status: 'active',
    target_executable: 'Code.exe', // Visual Studio Code
    target_arguments: ['force-focus-project'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'task-report-writing',
    user_id: 'desktop-user-123',
    task_name: '주간 보고서 작성',
    description: '지난 주 진척 사항 정리',
    due_date: '2024-07-26T17:00:00Z',
    status: 'active',
    target_executable: 'WINWORD.EXE', // MS Word
    target_arguments: ['C:\\Users\\User\\Documents\\weekly_report.docx'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'task-meeting-prep',
    user_id: 'desktop-user-123',
    task_name: '팀 미팅 준비',
    description: '발표 자료 검토',
    due_date: '2024-07-25T10:00:00Z',
    status: 'completed',
    target_executable: null, // 특정 앱 없음
    target_arguments: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];
// ------------------------------------

// --- 가짜 스케줄 데이터 정의 (Task ID 참조 업데이트) ---
let mockSchedules = [
  {
    id: 'schedule-001',
    user_id: 'desktop-user-123',
    task_id: 'task-coding-session', // <-- task-coding-session 참조
    name: '오전 코딩 집중 세션',
    start_time: '09:00',
    end_time: '11:00',
    days_of_week: [1, 2, 3, 4, 5], // 월-금
    created_at: new Date().toISOString(),
    is_active: true,
  },
  {
    id: 'schedule-002',
    user_id: 'desktop-user-123',
    task_id: 'task-report-writing', // <-- task-report-writing 참조
    name: '점심 후 보고서 작성',
    start_time: '13:00',
    end_time: '14:00',
    days_of_week: [1, 3, 5], // 월, 수, 금
    created_at: new Date().toISOString(),
    is_active: true,
  },
];
// ------------------------------------

// --- 핸들러 정의 ---
export const handlers = [
  // 1. GET /users/me
  http.get('/api/v1/users/me', () => {
    return HttpResponse.json(mockCurrentUser, { status: 200 });
  }),

  // 2. GET /profiles
  http.get('/api/v1/profiles', () => {
    return HttpResponse.json([mockDefaultProfile], { status: 200 });
  }),

  // 3. GET /profiles/{profile_id}
  http.get('/api/v1/profiles/:profileId', ({ params }) => {
    const { profileId } = params;
    if (profileId === mockDefaultProfile.id) {
      return HttpResponse.json(mockDefaultProfile, { status: 200 });
    }
    return HttpResponse.json({ detail: 'Profile not found' }, { status: 404 });
  }),

  // 4. POST /events
  http.post('/api/v1/events', async ({ request }) => {
    const requestBody = await request.json();
    console.log('[Mock API] Received Event:', requestBody);
    return HttpResponse.json({ status: 'success', event_id: uuidv4() }, { status: 200 });
  }),

  // 5. POST /sessions/start
  http.post('/api/v1/sessions/start', async ({ request }) => {
    const requestBody = await request.json();
    console.log('[Mock API] Session Start:', requestBody);
    return HttpResponse.json({ session_id: uuidv4(), status: 'started' }, { status: 200 });
  }),

  // 6. PUT /sessions/{session_id}
  http.put('/api/v1/sessions/:sessionId', async ({ params, request }) => {
    const { sessionId } = params;
    const requestBody = await request.json();
    console.log(`[Mock API] Session ${sessionId} Update:`, requestBody);
    return HttpResponse.json({ success: true, session_id: sessionId }, { status: 200 });
  }),

  // 7. GET /sessions/current
  http.get('/api/v1/sessions/current', () => {
    const activeSession = {
      id: 'session-active-123',
      user_id: 'desktop-user-123',
      profile_id: mockDefaultProfile.id,
      start_time: new Date(Date.now() - 3600 * 1000).toISOString(),
      status: 'active',
      goal_duration: 180,
      interruption_count: 5,
    };
    return HttpResponse.json(activeSession, { status: 200 });
  }),

  // 8. GET /schedules (사용자 스케줄 목록 조회)
  http.get('/api/v1/schedules', () => {
    return HttpResponse.json(mockSchedules, { status: 200 });
  }),

  // 9. POST /schedules (새로운 스케줄 등록)
  http.post('/api/v1/schedules', async ({ request }) => {
    const newScheduleData = await request.json();
    const newSchedule = {
      id: uuidv4(),
      user_id: 'desktop-user-123', // Mock user_id
      created_at: new Date().toISOString(),
      is_active: true,
      ...newScheduleData as any,
    };
    mockSchedules.push(newSchedule);
    return HttpResponse.json(newSchedule, { status: 200 });
  }),

  // 10. PUT /schedules/{schedule_id}
  http.put('/api/v1/schedules/:scheduleId', async ({ params, request }) => {
    const { scheduleId } = params;
    const updatedData = await request.json();
    const index = mockSchedules.findIndex(s => s.id === scheduleId);

    if (index !== -1) {
      mockSchedules[index] = { ...mockSchedules[index], ...updatedData as any};
      return HttpResponse.json({ success: true, schedule_id: scheduleId }, { status: 200 });
    }
    return HttpResponse.json({ detail: 'Schedule not found' }, { status: 404 });
  }),

  // 11. DELETE /schedules/{schedule_id}
  http.delete('/api/v1/schedules/:scheduleId', ({ params }) => {
    const { scheduleId } = params;
    const initialLength = mockSchedules.length;
    mockSchedules = mockSchedules.filter(s => s.id !== scheduleId);

    if (mockSchedules.length < initialLength) {
      return HttpResponse.json({ success: true, schedule_id: scheduleId }, { status: 200 });
    }
    return HttpResponse.json({ detail: 'Schedule not found' }, { status: 404 });
  }),

  // --- (추가) 12. GET /tasks (사용자 할 일 목록 조회) ---
  http.get('/api/v1/tasks', () => {
    return HttpResponse.json(mockTasks, { status: 200 });
  }),

  // --- (추가) 13. GET /tasks/{task_id} (특정 할 일 상세 조회) ---
  http.get('/api/v1/tasks/:taskId', ({ params }) => {
    const { taskId } = params;
    const task = mockTasks.find(t => t.id === taskId);
    if (task) {
      return HttpResponse.json(task, { status: 200 });
    }
    return HttpResponse.json({ detail: 'Task not found' }, { status: 404 });
  }),

  // --- (추가) 14. POST /tasks (새로운 할 일 추가) ---
  http.post('/api/v1/tasks', async ({ request }) => {
    const newTaskData = await request.json();
    const newTask = {
      id: uuidv4(),
      user_id: 'desktop-user-123',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...newTaskData as any,
    };
    mockTasks.push(newTask);
    return HttpResponse.json(newTask, { status: 200 });
  }),

  // --- (추가) 15. PUT /tasks/{task_id} (특정 할 일 업데이트) ---
  http.put('/api/v1/tasks/:taskId', async ({ params, request }) => {
    const { taskId } = params;
    const updatedData = await request.json();
    const index = mockTasks.findIndex(t => t.id === taskId);

    if (index !== -1) {
      mockTasks[index] = { ...mockTasks[index], ...updatedData as any, updated_at: new Date().toISOString() };
      return HttpResponse.json({ success: true, task_id: taskId }, { status: 200 });
    }
    return HttpResponse.json({ detail: 'Task not found' }, { status: 404 });
  }),
];