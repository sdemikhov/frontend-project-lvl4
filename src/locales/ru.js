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
      usernamePlaceholder: 'от 3 до 20 символов',
      password: 'Пароль',
      passwordPlaceholder: 'не менее 6 символов',
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
      oneOf: 'Пароли должны совпадать',
      min_0: 'Минимальная длина {{count}} символ',
      min_1: 'Минимальная длина {{count}} символа',
      min_2: 'Минимальная длина {{count}} символов',
      max_0: 'Максимальная длина {{count}} символ',
      max_1: 'Максимальная длина {{count}} символа',
      max_2: 'Максимальная длина {{count}} символов',
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
