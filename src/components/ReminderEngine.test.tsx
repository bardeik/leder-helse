import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ReminderEngine } from "@/components/ReminderEngine";
import * as notifications from "@/features/settings/notifications";

describe("ReminderEngine", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(notifications, "maybeSendScheduledReminders").mockImplementation(() => undefined);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("calls maybeSendScheduledReminders immediately on mount", () => {
    render(<ReminderEngine />);
    expect(notifications.maybeSendScheduledReminders).toHaveBeenCalledOnce();
  });

  it("calls maybeSendScheduledReminders on each 60-second interval tick", async () => {
    render(<ReminderEngine />);
    expect(notifications.maybeSendScheduledReminders).toHaveBeenCalledTimes(1);

    await act(async () => {
      vi.advanceTimersByTime(60_000);
    });
    expect(notifications.maybeSendScheduledReminders).toHaveBeenCalledTimes(2);

    await act(async () => {
      vi.advanceTimersByTime(60_000);
    });
    expect(notifications.maybeSendScheduledReminders).toHaveBeenCalledTimes(3);
  });

  it("clears the interval when the component unmounts", async () => {
    const { unmount } = render(<ReminderEngine />);

    unmount();

    await act(async () => {
      vi.advanceTimersByTime(120_000);
    });

    // Only the initial mount call; no further calls after unmount
    expect(notifications.maybeSendScheduledReminders).toHaveBeenCalledTimes(1);
  });

  it("renders nothing", () => {
    const { container } = render(<ReminderEngine />);
    expect(container.innerHTML).toBe("");
  });
});
