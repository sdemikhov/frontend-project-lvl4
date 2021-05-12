import * as Yup from 'yup';

Yup.setLocale({
  mixed: {
    required: () => ({ key: 'validation.required' }),
    oneOf: () => ({ key: 'validation.oneOf' }),
  },
  string: {
    min: ({ min }) => ({ key: 'validation.min', values: { count: min } }),
    max: ({ max }) => ({ key: 'validation.max', values: { count: max } }),
  },
});

export default {
  LoginFormSchema: Yup.object({
    username: Yup.string().required(),
    password: Yup.string().required(),
  }),
  MessageFormSchema: Yup.object({
    message: Yup.string().required(),
  }),
  ChannelIteractionFormSchema: Yup.object({
    channelName: Yup.string().required(),
  }),
  RegistrationFormSchema: Yup.object({
    username: Yup.string().required().min(3).max(20),
    password: Yup.string().required().min(6),
    passwordConfirmation: Yup.string().min(6)
      .oneOf([Yup.ref('password'), null]),
  }),
};
