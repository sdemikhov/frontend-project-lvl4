import * as Yup from 'yup';

Yup.setLocale({
  mixed: {
    required: () => ({ key: 'validation.required' }),
  },
  string: {
    min: ({ min }) => ({ key: 'validation.min', values: { count: min } }),
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
    username: Yup.string().required()
      .min(3, () => ({ key: 'validation.username' }))
      .max(20, () => ({ key: 'validation.username' })),
    password: Yup.string().required().min(6),
    passwordConfirmation: Yup.string().min(6)
      .oneOf([Yup.ref('password'), null], () => ({ key: 'validation.passwordConfirmation' })),
  }),
};
