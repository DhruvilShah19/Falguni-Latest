'use client';

interface Props {
  currentStep?: number;
}

export default function CheckoutStepper({ currentStep = 1 }: Props) {
  const steps = [
    { num: 1, title: 'Fulfillment', subtitle: 'Delivery or Pickup' },
    { num: 2, title: 'Payment', subtitle: 'Select payment method' },
    { num: 3, title: 'Confirmation', subtitle: 'Place your order' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto mb-8 sm:mb-10 px-2 sm:px-4">
      <div className="flex items-center justify-between relative">
        {steps.map((step, idx) => {
          const isActive = step.num === currentStep;
          const isCompleted = step.num < currentStep;

          return (
            <div key={step.num} className="flex items-center flex-1 last:flex-none">
              {/* Step Circle & Text */}
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-colors ${
                    isActive || isCompleted
                      ? 'bg-[#733617] text-white'
                      : 'bg-white border border-[#DBCFC4] text-[#8A796F]'
                  }`}
                >
                  {step.num}
                </div>
                <div className="hidden sm:block text-left">
                  <p
                    className={`text-xs font-bold leading-tight ${
                      isActive ? 'text-[#2D1508]' : 'text-[#65544A]'
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-[10px] text-[#8A796F] leading-tight">
                    {step.subtitle}
                  </p>
                </div>
              </div>

              {/* Connecting Line (for all except last) */}
              {idx < steps.length - 1 && (
                <div className="flex-1 mx-2 sm:mx-4 h-px bg-[#EFE6DC]" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
