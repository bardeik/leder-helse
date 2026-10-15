import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ManualTimerPage } from "./ManualTimerPage";
import { useManualTimer } from "./hooks/useManualTimer";

vi.mock("./hooks/useManualTimer", () => ({ useManualTimer: vi.fn() }));

describe("ManualTimerPage", () => {
  let value: ReturnType<typeof useManualTimer>;
  beforeEach(() => {
    value = {
      settings: { activitySeconds: 40, restSeconds: 20, rounds: 6 },
      timer: { phase: "ready", remainingMs: 3000, completedRounds: 0 },
      running: false,
      started: false,
      muted: false,
      wakeStatus: "inactive",
      audioUnavailable: false,
      start: vi.fn(),
      pause: vi.fn(),
      reset: vi.fn(),
      updateSettings: vi.fn(),
      toggleMute: vi.fn()
    };
    vi.mocked(useManualTimer).mockImplementation(() => value);
  });
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders defaults and required adjustment increments", () => {
    render(<ManualTimerPage />);
    expect(screen.getByLabelText("Aktivitet (sekunder)", { exact: true })).toHaveValue(40);
    fireEvent.click(screen.getByRole("button", { name: "Øk aktivitet (sekunder)" }));
    expect(value.updateSettings).toHaveBeenLastCalledWith({ ...value.settings, activitySeconds: 50 });
    fireEvent.click(screen.getByRole("button", { name: "Senk pause (sekunder)" }));
    expect(value.updateSettings).toHaveBeenLastCalledWith({ ...value.settings, restSeconds: 10 });
    fireEvent.click(screen.getByRole("button", { name: "Øk runder" }));
    expect(value.updateSettings).toHaveBeenLastCalledWith({ ...value.settings, rounds: 7 });
  });

  it("allows direct integer editing and blocks empty, fractional and out-of-range values", () => {
    render(<ManualTimerPage />);
    const input = screen.getByLabelText("Runder", { exact: true });
    for (const raw of ["", "0", "100", "1.5"]) {
      fireEvent.change(input, { target: { value: raw } });
      expect(screen.getByRole("button", { name: "Start" })).toBeDisabled();
      expect(input).toHaveAttribute("aria-invalid", "true");
    }
    fireEvent.change(input, { target: { value: "8" } });
    fireEvent.blur(input);
    expect(value.updateSettings).toHaveBeenLastCalledWith({ ...value.settings, rounds: 8 });
    expect(screen.getByRole("button", { name: "Start" })).toBeEnabled();
  });

  it("disables adjustment buttons at the boundaries", () => {
    value.settings = { activitySeconds: 10, restSeconds: 0, rounds: 99 };
    render(<ManualTimerPage />);
    expect(screen.getByRole("button", { name: "Senk aktivitet (sekunder)" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Senk pause (sekunder)" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Øk runder" })).toBeDisabled();
  });

  it("locks settings and shows completed and remaining rounds while running", () => {
    value.started = value.running = true;
    value.timer = { phase: "rest", remainingMs: 12500, completedRounds: 2 };
    const { container } = render(<ManualTimerPage />);
    expect(screen.getByLabelText("Runder", { exact: true })).toBeDisabled();
    expect(screen.getByLabelText("sekunder", { exact: true })).toHaveTextContent("13");
    expect(Array.from(container.querySelectorAll("dd"), (element) => element.textContent)).toEqual(["2", "4"]);
    fireEvent.click(screen.getByRole("button", { name: "Sett på vent" }));
    expect(value.pause).toHaveBeenCalledOnce();
  });

  it("starts, continues and toggles sound", () => {
    const { rerender } = render(<ManualTimerPage />);
    fireEvent.click(screen.getByRole("button", { name: "Start" }));
    expect(value.start).toHaveBeenCalledOnce();
    value = { ...value, started: true, muted: true };
    rerender(<ManualTimerPage />);
    expect(screen.getByText("Klargjøring - På vent")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Fortsett" }));
    expect(value.start).toHaveBeenCalledTimes(2);
    fireEvent.click(screen.getByRole("button", { name: "Slå på lyd" }));
    expect(value.toggleMute).toHaveBeenCalledOnce();
  });

  it("confirms resetting an unfinished session", () => {
    value.started = true;
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    render(<ManualTimerPage />);
    fireEvent.click(screen.getByRole("button", { name: "Nullstill" }));
    expect(value.reset).not.toHaveBeenCalled();
    confirm.mockReturnValue(true);
    fireEvent.click(screen.getByRole("button", { name: "Nullstill" }));
    expect(value.reset).toHaveBeenCalledOnce();
  });

  it("shows completion and permits reset without confirmation", () => {
    value.started = true;
    value.timer = { phase: "complete", remainingMs: 0, completedRounds: 6 };
    const confirm = vi.spyOn(window, "confirm");
    render(<ManualTimerPage />);
    expect(screen.getByText("Fullført", { exact: true })).toBeVisible();
    expect(screen.getByRole("button", { name: "Fortsett" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Nullstill" }));
    expect(confirm).not.toHaveBeenCalled();
    expect(value.reset).toHaveBeenCalledOnce();
  });

  it("reports unavailable browser capabilities and active screen lock", () => {
    value.started = true;
    value.wakeStatus = "unavailable";
    value.audioUnavailable = true;
    const { rerender } = render(<ManualTimerPage />);
    expect(screen.getAllByRole("alert")).toHaveLength(2);
    value = { ...value, wakeStatus: "active", audioUnavailable: false };
    rerender(<ManualTimerPage />);
    expect(screen.getByText("Skjermen holdes våken")).toBeVisible();
  });
});
