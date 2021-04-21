import * as Yup from 'yup';

const buildSchemas = () => {
  Yup.setLocale({
    mixed: {
      required: () => ({ key: 'validation.required' }),
    },
  });

  return {
    LoginFormSchema: Yup.object({
      username: Yup.string().required(),
      password: Yup.string().required(),
    }),
  };
};

export default buildSchemas();
