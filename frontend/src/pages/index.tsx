import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: "/landing",
      permanent: false,
    },
  };
};

export default function Index() {
  return null;
}

