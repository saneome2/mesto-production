const getTemplate = () => {
  return document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);
};

export const createCardElement = (
  data,
  userId,
  { onPreviewPicture, onLikeIcon, onDeleteCard }
) => {
  const cardElement = getTemplate();
  const likeButton = cardElement.querySelector(".card__like-button");
  const deleteButton = cardElement.querySelector(".card__control-button_type_delete");
  const cardImage = cardElement.querySelector(".card__image");
  const likeCount = cardElement.querySelector(".card__like-count");

  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardElement.querySelector(".card__title").textContent = data.name;
  cardElement.dataset.cardId = data._id;

  likeCount.textContent = data.likes.length;

  const isLiked = data.likes.some((like) => like._id === userId);
  if (isLiked) {
    likeButton.classList.add("card__like-button_is-active");
  }

  if (data.owner._id !== userId) {
    deleteButton.remove();
  } else {
    if (onDeleteCard) {
      deleteButton.addEventListener("click", () => onDeleteCard(cardElement, data._id));
    }
  }

  if (onLikeIcon) {
    likeButton.addEventListener("click", () => onLikeIcon(likeButton, data._id, isLiked, likeCount));
  }

  if (onPreviewPicture) {
    cardImage.addEventListener("click", () => onPreviewPicture({ name: data.name, link: data.link }));
  }

  return cardElement;
};

export const updateLikeState = (likeButton, isLiked, likeCount, likes) => {
  if (isLiked) {
    likeButton.classList.remove("card__like-button_is-active");
  } else {
    likeButton.classList.add("card__like-button_is-active");
  }
  likeCount.textContent = likes.length;
};
