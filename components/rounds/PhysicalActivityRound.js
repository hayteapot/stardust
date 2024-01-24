import React from "react";
import ActivityRound from "@components/rounds/ActivityRound";
import { useEffect, useState } from "react";

const PhysicalActivityRound = ({
  activityId,
  leadPlayerId,
  leadPlayerName,
  shieldGoal,
  groupGoal,
  players,
  isActivityCompleted,
  prizePot,
  roundName,
  currentPlayer,
  canSpeak,
  gameId,
}) => {
  const [activityCompleted, setActivityCompleted] =
    useState(isActivityCompleted);
  const [currentStep, setCurrentStep] = useState(0);
  const [activitySteps, setActivitySteps] = useState([
    "You have been given a daily challenge to complete.",
    "You must work together to complete the challenge. When you press next, the activity will start, and you will have 90 seconds to complete it",
    groupGoal,
    "Time is up!. Let's see how well you did.",
  ]);
  const [shieldPlayer, setShieldPlayer] = useState(null);
  const [timer, setTimer] = useState(90);

  useEffect(() => {
    if (leadPlayerId === currentPlayer?.playerId) {
      let countdown;

      if (currentStep === 2 && !activityCompleted) {
        countdown = setInterval(() => {
          setTimer((prevTimer) => prevTimer - 1);
        }, 1000);
      }

      return () => {
        clearInterval(countdown);
      };
    }
  }, [currentStep, activityCompleted]);

  useEffect(() => {
    if (leadPlayerId === currentPlayer?.playerId) {
      if (timer === 0) {
        // Timer has run out, proceed to the next step
        setCurrentStep(currentStep + 1);
        setActivityCompleted(true);
      }
    }
  }, [timer, currentStep]);

  return (
    <>
      <ActivityRound
        leadPlayerId={leadPlayerId}
        leadPlayerName={leadPlayerName}
        canSpeak={canSpeak}
        roundName={roundName}
        roundComponents={
          <>
            {currentStep === 2 && <b>{`Time remaining: ${timer} seconds`}</b>}
            <p>{activitySteps[currentStep]}</p>
            {currentStep >= 2 && (
              <p>
                <i>{shieldGoal}</i>
              </p>
            )}
            {currentStep < activitySteps.length - 1 ? (
              <button
                onClick={() => {
                  if (currentStep === 2) {
                    setActivityCompleted(true);
                  }
                  setCurrentStep(currentStep + 1);
                }}
              >
                {currentStep === 2 ? "Task complete" : "Next instruction"}
              </button>
            ) : (
              <>
                <p>Did any player get the shield?</p>
                {players.map((player) => (
                  <button
                    onClick={() => {
                      setShieldPlayer(player);
                    }}
                  >
                    {player.playerName}
                  </button>
                ))}
                {shieldPlayer && (
                  <p>The shield was won by {shieldPlayer.playerName}</p>
                )}

                <p>When you're ready, mark the activity as completed:</p>

                {activityCompleted && (
                  <button
                    onClick={() => {
                      fetch(
                        `/api/games/${gameId}/sessions/${currentPlayer.playerId}/completeActivity?activityId=${activityId}&prizePot=${prizePot}&shieldPlayerId=${shieldPlayer?.playerId}`
                      );
                    }}
                  >
                    Finish Activity
                  </button>
                )}
              </>
            )}
          </>
        }
        currentPlayer={currentPlayer}
      />
    </>
  );
};

export default PhysicalActivityRound;
