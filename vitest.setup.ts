import "@testing-library/jest-dom";
import { beforeAll, vi } from "vitest";

beforeAll(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  vi.useRealTimers();
});
