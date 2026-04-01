import {
  getUserInfo,
  getCardList,
  setUserInfo,
  setUserAvatar,
  addCard,
  deleteCard,
  changeLikeCardStatus,
} from "./components/api.js";

import { createCardElement, updateLikeState } from "./components/card.js";
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js";
import { enableValidation, clearValidation } from "./components/validation.js";

const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatarContainer = document.querySelector(".profile__image-container");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");

const usersStatsModalWindow = document.querySelector(".popup_type_info");
const usersStatsModalInfoList = usersStatsModalWindow.querySelector(".popup__info-list");
const usersStatsModalList = usersStatsModalWindow.querySelector(".popup__list");
const logo = document.querySelector(".header__logo");

const deleteCardModalWindow = document.querySelector(".popup_type_delete-card");
const deleteCardForm = deleteCardModalWindow.querySelector(".popup__form");

let currentCardToDelete = null;

let currentUserId = null;

const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

const formatDate = (date) =>
  date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const createInfoString = (term, definition) => {
  const li = document.createElement("li");
  li.className = "popup__info-item";
  const dt = document.createElement("dt");
  dt.className = "popup__info-term";
  dt.textContent = term;
  const dd = document.createElement("dd");
  dd.className = "popup__info-description";
  dd.textContent = definition;
  li.appendChild(dt);
  li.appendChild(dd);
  return li;
};

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = profileForm.querySelector(".popup__button");
  submitButton.textContent = "Сохранение...";

  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModalWindow(profileFormModalWindow);
    })
    .catch(() => {})
    .finally(() => {
      submitButton.textContent = "Сохранить";
    });
};

const handleAvatarFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = avatarForm.querySelector(".popup__button");
  submitButton.textContent = "Сохранение...";

  setUserAvatar({ avatar: avatarInput.value })
    .then((userData) => {
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
      avatarForm.reset();
      closeModalWindow(avatarFormModalWindow);
    })
    .catch(() => {})
    .finally(() => {
      submitButton.textContent = "Сохранить";
    });
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = cardForm.querySelector(".popup__button");
  submitButton.textContent = "Создание...";

  addCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
    .then((cardData) => {
      placesWrap.prepend(
        createCardElement(cardData, currentUserId, {
          onPreviewPicture: handlePreviewPicture,
          onLikeIcon: handleLikeCard,
          onDeleteCard: handleDeleteCard,
        })
      );
      cardForm.reset();
      closeModalWindow(cardFormModalWindow);
    })
    .catch(() => {})
    .finally(() => {
      submitButton.textContent = "Создать";
    });
};

const handleLikeCard = (likeButton, cardId, isLiked, likeCount) => {
  changeLikeCardStatus(cardId, isLiked)
    .then((cardData) => {
      updateLikeState(likeButton, isLiked, likeCount, cardData.likes);
    })
    .catch(() => {});
};

const handleDeleteCard = (cardElement, cardId) => {
  currentCardToDelete = { cardElement, cardId };
  openModalWindow(deleteCardModalWindow);
};

const handleConfirmDeleteCard = () => {
  if (currentCardToDelete) {
    const submitButton = deleteCardForm.querySelector(".popup__button");
    submitButton.textContent = "Удаление...";
    
    deleteCard(currentCardToDelete.cardId)
      .then(() => {
        currentCardToDelete.cardElement.remove();
        closeModalWindow(deleteCardModalWindow);
      })
      .catch(() => {})
      .finally(() => {
        submitButton.textContent = "Да";
        currentCardToDelete = null;
      });
  }
};

deleteCardForm.addEventListener("submit", (e) => {
  e.preventDefault();
  handleConfirmDeleteCard();
});

const handleLogoClick = () => {
  getCardList()
    .then((cards) => {
      usersStatsModalInfoList.innerHTML = "";
      usersStatsModalList.innerHTML = "";

      usersStatsModalInfoList.append(
        createInfoString("Количество карточек:", cards.length)
      );

      const sortedByDate = [...cards].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );

      if (sortedByDate.length > 0) {
        usersStatsModalInfoList.append(
          createInfoString(
            "Первая создана:",
            formatDate(new Date(sortedByDate[0].createdAt))
          )
        );
        usersStatsModalInfoList.append(
          createInfoString(
            "Последняя создана:",
            formatDate(new Date(sortedByDate[sortedByDate.length - 1].createdAt))
          )
        );
      }

      const usersMap = new Map();
      cards.forEach((card) => {
        const ownerId = card.owner._id;
        if (!usersMap.has(ownerId)) {
          usersMap.set(ownerId, {
            name: card.owner.name,
            avatar: card.owner.avatar,
            count: 0,
          });
        }
        usersMap.get(ownerId).count++;
      });

      const sortedUsers = [...usersMap.values()].sort((a, b) => b.count - a.count);

      sortedUsers.slice(0, 5).forEach((user) => {
        const li = document.createElement("li");
        li.className = "popup__list-item";
        li.textContent = `${user.name}: ${user.count} карточек`;
        usersStatsModalList.append(li);
      });

      openModalWindow(usersStatsModalWindow);
    })
    .catch(() => {});
};

profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFormSubmit);

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  clearValidation(profileForm, validationSettings);
  openModalWindow(profileFormModalWindow);
});

profileAvatarContainer.addEventListener("click", () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationSettings);
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  clearValidation(cardForm, validationSettings);
  openModalWindow(cardFormModalWindow);
});

logo.addEventListener("click", handleLogoClick);

const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

enableValidation(validationSettings);

Promise.all([getCardList(), getUserInfo()])
  .then(([cards, userData]) => {
    currentUserId = userData._id;
    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;

    cards.forEach((cardData) => {
      placesWrap.append(
        createCardElement(cardData, currentUserId, {
          onPreviewPicture: handlePreviewPicture,
          onLikeIcon: handleLikeCard,
          onDeleteCard: handleDeleteCard,
        })
      );
    });
  })
  .catch(() => {});
