const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[+()\d\s-]{7,30}$/;

export function validateLead(values) {
  const errors = {};

  if (!values.name.trim()) {
    errors.name = 'Name is required.';
  } else if (values.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters.';
  }

  if (!values.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!emailPattern.test(values.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }

  if (!values.phone.trim()) {
    errors.phone = 'Phone is required.';
  } else if (!phonePattern.test(values.phone.trim())) {
    errors.phone = 'Enter a valid phone number.';
  }

  if (!values.company.trim()) {
    errors.company = 'Company is required.';
  } else if (values.company.trim().length < 2) {
    errors.company = 'Company must be at least 2 characters.';
  }

  if (!values.source) {
    errors.source = 'Choose a source.';
  }

  if (!values.status) {
    errors.status = 'Choose a status.';
  }

  return errors;
}

export function getApiError(error, fallback = 'Something went wrong. Please try again.') {
  return error.response?.data?.message || fallback;
}

export function getFieldErrors(error) {
  const details = error.response?.data?.errors;
  if (!Array.isArray(details)) return {};

  return details.reduce((result, item) => {
    if (item.field && !result[item.field]) {
      result[item.field] = item.message;
    }
    return result;
  }, {});
}
