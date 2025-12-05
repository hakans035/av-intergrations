'use client';

import { Form, ambitionValleyForm, useFormSubmission } from '@/integrations/form';

export default function Home() {
  const { submitForm, isSubmitting, error } = useFormSubmission({
    formId: ambitionValleyForm.id,
    onSuccess: (result) => {
      console.log('Form submitted successfully:', result);
    },
    onError: (err) => {
      console.error('Form submission error:', err);
    },
  });

  return (
    <>
      <Form form={ambitionValleyForm} onSubmit={submitForm} />
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 shadow-lg">
            <p className="text-gray-800">Bezig met verzenden...</p>
          </div>
        </div>
      )}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {error}
        </div>
      )}
    </>
  );
}
