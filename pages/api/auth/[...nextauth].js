import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "../../../lib/mongodb";
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs'; // Importar bcrypt

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  adapter: MongoDBAdapter(clientPromise),
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    error: '/auth/error', // Página de error personalizada
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account.provider === "google") {
        const { email } = user;
        const client = await clientPromise;
        const db = client.db();
        const usuariosCollection = db.collection("usuarios");

        // Buscar si el usuario ya existe en la colección 'usuarios'
        const existingUser = await usuariosCollection.findOne({ correo: email });

        if (existingUser) {
          if (!existingUser.oauth) {
            // Vincular la cuenta OAuth con el usuario existente
            await usuariosCollection.updateOne(
              { _id: existingUser._id },
              { $set: { oauth: true } }
            );
          }
          // Asignar el _id del usuario existente para usarlo en el token
          user.usuarioId = existingUser._id;
        } else {
          // Encriptar la contraseña (utilizando el correo electrónico)
          const hashedPassword = await bcrypt.hash(email, 10); // 10 es el número de saltos

          // Insertar nuevo usuario en la colección 'usuarios'
          const result = await usuariosCollection.insertOne({
            correo: email,
            nombre: email, // Usar el correo como nombre
            contraseña: hashedPassword, // Contraseña encriptada
            oauth: true,
          });

          // Asignar el _id del nuevo usuario para usarlo en el token
          user.usuarioId = result.insertedId;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user?.usuarioId) {
        token.usuarioId = user.usuarioId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.usuarioId) {
        session.user.usuarioId = token.usuarioId;
      }
      return session;
    },
  },
});