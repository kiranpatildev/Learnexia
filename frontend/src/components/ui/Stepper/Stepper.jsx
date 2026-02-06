import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

const Stepper = ({ steps, currentStep, onStepClick }) => {
    return (
        <div className="w-full py-6">
            <div className="flex items-center justify-between relative">
                {/* Progress Bar Background */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full -z-10" />

                {/* Active Progress Bar */}
                <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#5227FF] rounded-full -z-10 transition-all duration-500 ease-in-out"
                    style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                />

                {steps.map((step, index) => {
                    const isCompleted = index + 1 < currentStep;
                    const isCurrent = index + 1 === currentStep;

                    return (
                        <div
                            key={step.id}
                            className="flex flex-col items-center cursor-pointer group"
                            onClick={() => onStepClick && onStepClick(index + 1)}
                        >
                            <div
                                className={`
                  w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                  ${isCompleted
                                        ? 'bg-[#5227FF] border-[#5227FF] text-white scale-100'
                                        : isCurrent
                                            ? 'bg-white border-[#5227FF] text-[#5227FF] scale-110 shadow-[0_0_15px_rgba(82,39,255,0.3)]'
                                            : 'bg-white border-gray-300 text-gray-400 group-hover:border-[#B19EEF]'}
                `}
                            >
                                {isCompleted ? <Check className="w-5 h-5" /> : <span>{index + 1}</span>}
                            </div>
                            <span
                                className={`
                    mt-2 text-sm font-medium transition-colors duration-300 absolute top-12 whitespace-nowrap
                    ${isCurrent ? 'text-[#5227FF]' : isCompleted ? 'text-gray-900' : 'text-gray-400'}
                `}
                            >
                                {step.name}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Stepper;
