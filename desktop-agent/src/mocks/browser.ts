// 파일 위치: Force-Focus/desktop-agent/src/mocks/browser.ts
import { setupWorker } from 'msw/browser'; // MSW v2 변경: /browser 에서 setupWorker 임포트
import { handlers } from './handlers';

// 위에서 정의한 핸들러들을 사용하여 서비스 워커를 설정합니다.
export const worker = setupWorker(...handlers);