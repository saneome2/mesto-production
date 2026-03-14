// Функция показывает ошибку валидации поля
function showInputError(formElement, inputElement, errorMessage, settings) {
  const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
  inputElement.classList.add(settings.inputErrorClass);
  errorElement.textContent = errorMessage;
  errorElement.classList.add(settings.errorClass);
}

// Функция скрывает ошибку валидации поля
function hideInputError(formElement, inputElement, settings) {
  const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
  inputElement.classList.remove(settings.inputErrorClass);
  errorElement.textContent = '';
  errorElement.classList.remove(settings.errorClass);
}

// Проверяет валидность поля
function checkInputValidity(formElement, inputElement, settings) {
  if (inputElement.validity.patternMismatch) {
    // Если есть кастомное сообщение об ошибке, используем его
    if (inputElement.dataset.errorMessage) {
      showInputError(formElement, inputElement, inputElement.dataset.errorMessage, settings);
    } else {
      showInputError(formElement, inputElement, inputElement.validationMessage, settings);
    }
  } else if (inputElement.validity.valueMissing) {
    showInputError(formElement, inputElement, inputElement.validationMessage, settings);
  } else if (inputElement.validity.tooShort || inputElement.validity.tooLong) {
    showInputError(formElement, inputElement, inputElement.validationMessage, settings);
  } else if (inputElement.validity.typeMismatch) {
    showInputError(formElement, inputElement, inputElement.validationMessage, settings);
  } else {
    hideInputError(formElement, inputElement, settings);
  }
}

// Проверяет, есть ли невалидные поля в списке
function hasInvalidInput(inputList) {
  return inputList.some((inputElement) => {
    return !inputElement.validity.valid;
  });
}

// Делает кнопку отправки неактивной
function disableSubmitButton(buttonElement, settings) {
  buttonElement.classList.add(settings.inactiveButtonClass);
  buttonElement.disabled = true;
}

// Делает кнопку отправки активной
function enableSubmitButton(buttonElement, settings) {
  buttonElement.classList.remove(settings.inactiveButtonClass);
  buttonElement.disabled = false;
}

// Переключает состояние кнопки отправки в зависимости от валидности полей
function toggleButtonState(inputList, buttonElement, settings) {
  if (hasInvalidInput(inputList)) {
    disableSubmitButton(buttonElement, settings);
  } else {
    enableSubmitButton(buttonElement, settings);
  }
}

// Устанавливает обработчики ввода для всех полей формы
function setEventListeners(formElement, settings) {
  const inputList = Array.from(formElement.querySelectorAll(settings.inputSelector));
  const buttonElement = formElement.querySelector(settings.submitButtonSelector);

  // Изначально проверяем состояние кнопки
  toggleButtonState(inputList, buttonElement, settings);

  inputList.forEach((inputElement) => {
    inputElement.addEventListener('input', () => {
      checkInputValidity(formElement, inputElement, settings);
      toggleButtonState(inputList, buttonElement, settings);
    });
  });
}

// Очищает валидацию формы и делает кнопку неактивной
function clearValidation(formElement, settings) {
  const inputList = Array.from(formElement.querySelectorAll(settings.inputSelector));
  const buttonElement = formElement.querySelector(settings.submitButtonSelector);

  inputList.forEach((inputElement) => {
    hideInputError(formElement, inputElement, settings);
  });

  disableSubmitButton(buttonElement, settings);
}

// Включает валидацию для всех форм на странице
function enableValidation(settings) {
  const formList = Array.from(document.querySelectorAll(settings.formSelector));
  formList.forEach((formElement) => {
    setEventListeners(formElement, settings);
  });
}

// Экспортируем функции
export { enableValidation, clearValidation };