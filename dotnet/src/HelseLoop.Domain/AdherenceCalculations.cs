namespace HelseLoop.Domain;

/// <summary>
/// Adherence and workout-progress calculations shared between the dashboard
/// and the reminder engine. Pure functions; no clock or storage access.
/// </summary>
public static class AdherenceCalculations
{
    /// <summary>
    /// Counts strength/walk sessions inside a Monday-based week and derives the
    /// remaining amount needed to reach <see cref="WeeklyGoals.WeeklyStrengthGoal"/>
    /// and <see cref="WeeklyGoals.WeeklyWalkGoal"/>.
    /// </summary>
    public static WeeklyWorkoutProgress CalculateWeeklyWorkoutProgress(
        DateOnly weekStartDate,
        IEnumerable<WorkoutLog> workoutLogs)
    {
        ArgumentNullException.ThrowIfNull(workoutLogs);

        var weekEndDate = weekStartDate.AddDays(6);
        var strength = 0;
        var walks = 0;

        foreach (var workout in workoutLogs)
        {
            if (workout.Date < weekStartDate || workout.Date > weekEndDate)
            {
                continue;
            }

            switch (workout.Type)
            {
                case WorkoutType.Strength:
                    strength++;
                    break;
                case WorkoutType.Walk:
                    walks++;
                    break;
            }
        }

        var completedGoals =
            Math.Min(strength, WeeklyGoals.WeeklyStrengthGoal) +
            Math.Min(walks, WeeklyGoals.WeeklyWalkGoal);

        var remainingStrength = Math.Max(0, WeeklyGoals.WeeklyStrengthGoal - strength);
        var remainingWalks = Math.Max(0, WeeklyGoals.WeeklyWalkGoal - walks);

        return new WeeklyWorkoutProgress(
            StrengthWorkouts: strength,
            Walks: walks,
            CompletedGoals: completedGoals,
            RemainingStrengthWorkouts: remainingStrength,
            RemainingWalks: remainingWalks,
            RemainingGoals: remainingStrength + remainingWalks);
    }

    /// <summary>
    /// Calculates adherence for a Monday-based week. When <paramref name="today"/>
    /// falls inside the week, the energy/sleep denominators are prorated to elapsed
    /// days so a partial week doesn't score as if it were complete.
    /// </summary>
    public static WeeklyAdherence CalculateWeeklyAdherence(
        DateOnly weekStartDate,
        IEnumerable<DailyLog> dailyLogs,
        IEnumerable<WorkoutLog> workoutLogs,
        DateOnly? today = null)
    {
        ArgumentNullException.ThrowIfNull(dailyLogs);
        ArgumentNullException.ThrowIfNull(workoutLogs);

        var weekEndDate = weekStartDate.AddDays(6);
        var energyDays = 0;
        var sleepDays = 0;

        foreach (var log in dailyLogs)
        {
            if (log.Date < weekStartDate || log.Date > weekEndDate)
            {
                continue;
            }

            if (log.Energy is >= ValueRanges.EnergyMin and <= ValueRanges.EnergyMax)
            {
                energyDays++;
            }
            // sleepOk is always a boolean once inside the domain
            sleepDays++;
        }

        var workoutProgress = CalculateWeeklyWorkoutProgress(weekStartDate, workoutLogs);
        var workouts = workoutProgress.CompletedGoals;

        var isCurrentWeek = today is { } t && t >= weekStartDate && t <= weekEndDate;
        var daysElapsed = isCurrentWeek
            ? Math.Min(7, today!.Value.DayNumber - weekStartDate.DayNumber + 1)
            : 7;

        var completed = energyDays + sleepDays + workouts;
        var total = daysElapsed + daysElapsed + WeeklyGoals.WeeklyWorkoutGoal;
        var adherencePercent = total == 0
            ? 0
            : (int)Math.Round(completed / (double)total * 100.0, MidpointRounding.AwayFromZero);

        return new WeeklyAdherence(
            WeekStartDate: weekStartDate,
            EnergyDays: energyDays,
            SleepDays: sleepDays,
            Workouts: workouts,
            AdherencePercent: adherencePercent,
            Status: WeeklyGoals.GetHealthStatus(adherencePercent));
    }
}
