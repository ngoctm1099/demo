import React, { Fragment } from "react";
import classnames from "classnames";
import ProgressBar from "./ProgressBar";

interface StepbarProps {
  tiers: any;
  currentTier?: any;
  hidePoints?: boolean;
  progressBarColor?: string;
  className?: string;
}

const generateProgressWidth = (currentPoints, tierPoints, prevTierPoints, nextTierPoints) => {
  if (currentPoints < tierPoints) return "0%";
  if (currentPoints < nextTierPoints)
    return `${
      Math.abs((currentPoints - tierPoints) * 100) / (tierPoints - prevTierPoints || nextTierPoints - prevTierPoints)
    }%`;
  else return "100%";
};

const Stepbar = ({
  tiers,
  hidePoints,
  progressBarColor,
  className,
  currentTier = { title: "", points: 0 },
}: StepbarProps) => {
  const renderBar = data =>
    data?.map((tier, index) => {
      const tiersLength = tiers?.length;
      const prevPoints = tiers[index > 0 ? index - 1 : 0]?.points;
      const nextPoints = tiers[index < tiersLength - 1 ? index + 1 : index]?.points;

      return (
        <Fragment key={`${tier}-${index}`}>
          <div className={classnames("flex flex-col min-w-fit items-center gap-3 text-gray-500", className)}>
            <div
              className={classnames(
                "w-8 h-8 mx-auto rounded-full text-lg text-white flex items-center",
                currentTier?.points >= tier?.points ? tier?.color : "bg-gray-100"
              )}
            >
              <span className="text-white text-xs sm:text-base text-center w-full inline-flex justify-center items-center">
                {tier?.icon}
              </span>
            </div>
            <div className="text-xs text-center">
              {tier?.title} {!hidePoints && `(${tier?.points})`}
            </div>
          </div>
          {index < tiers?.length - 1 && (
            <ProgressBar
              progressWidth={generateProgressWidth(currentTier?.points, tier?.points, prevPoints, nextPoints)}
              width="w-full"
              className="mb-6"
              color={progressBarColor}
            />
          )}
        </Fragment>
      );
    });

  return <div className="flex justify-between">{renderBar(tiers)}</div>;
};

export default Stepbar;
