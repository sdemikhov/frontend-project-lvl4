export default {
  translation: {
    languages: {
      ru: 'Русский',
    },
    navbar: {
      brand: 'Hexlet Chat',
      signout: 'Выйти',
      notLoggedIn: 'Вход не выполнен',
    },
    loginForm: {
      username: 'Ваш ник',
      password: 'Пароль',
      submit: 'Войти',
      newUser: 'Нет аккаунта?',
      registration: 'Регистрация',
      alreadyLoggedIn: 'Вход в учетную запись уже выполнен',
    },
    registerForm: {
      username: 'Имя пользователя',
      usernamePlaceholder: 'От 3 до 20 символов',
      password: 'Пароль',
      passwordPlaceholder: 'Не менее 6 символов',
      passwordConfirmation: 'Подтвердите пароль',
      passwordConfirmationPlaceholder: 'Пароли должны совпадать',
      submit: 'Зарегистрироваться',
      alreadyLoggedIn: 'Для регистрации нового пользователя выйдите из текущей учетной записи',
    },
    sendMessageForm: {
      sendButton: 'Отправить',
    },
    channelInteractionForm: {
      sendButton: 'Отправить',
      cancelButton: 'Отменить',
    },
    channelsNav: {
      dropdownRename: 'Переименовать',
      dropdownRemove: 'Удалить',
      addButton: 'Новый...',
    },
    modal: {
      titles: {
        removeChannel: 'Удалить канал',
        renameChannel: 'Переименовать канал',
        newChannel: 'Создать канал',
      },
      removeButton: 'Удалить',
      cancelButton: 'Отменить',
    },
    validation: {
      required: 'Поле обязательно к заполнению',
      min_0: 'Не менее {{count}} символ',
      min_1: 'Не менее {{count}} символа',
      min_2: 'Не менее {{count}} символов',
      username: 'От 3 до 20 символов',
      password: 'Не менее 6 символов',
      passwordConfirmation: 'Пароли должны совпадать',
    },
    errors: {
      network: {
        unauthorized: 'Неверные имя пользователя или пароль',
        unknown: 'Во время подключения по сети произошла ошибка, попробуйте еще раз позже',
        userAlreadyExist: 'Пользователь с таким именем уже существует',
      },
      unknown: 'Произошла неизвестная ошибка',
      pageNotFound: 'Страница не найдена',
    },
    chat: {
      loading: 'Загружаю данные...',
    },
  },
};
