import { sendResetPasswordEmail } from "../lib/nodeMailer";
import { prisma } from "../lib/prisma";
import crypto from "node:crypto"

//Função para fazer o reset da senha e criar uma token e uma data de expiração
export async function requestPasswordResetHandler(email: string) { 
  const user = await prisma.user.findUnique({
    where: {
      email
    }
  })

  if(!user) {
    throw new Error("User not found")
  }

  const resetToken = crypto.randomBytes(32).toString("hex")
  const tokenExpiry = new Date(Date.now() + 360_000_0) //1 hora

  //Atualiza os campos com o token e a data de expiração
  await prisma.user.update({
    where: {
      email
    },
    data: {
      resetToken,
      resetTokenExpiresAt: tokenExpiry
    }
  })

  // Executa a função para enviar o email com o token para o email do usuário
  await sendResetPasswordEmail(email, resetToken)
}


//função para trocar a senha do usuário com o token válido
export async function changePasswordHandler(resetToken: string, newPassword: string) {
  const user = await prisma.user.findUnique({
    where: {
      resetToken
    }
  })

  const dateNow = new Date()

  //Verifica se existe um usuário ou se não passou a data expiração do token
  if(!user || user.resetTokenExpiresAt! < dateNow) {
    throw new Error("Token is invalid or has expired")
  }

  //Atualiza os dados com a nova senha e reseta os campos resetToken e resetTokenExpiresAt
  await prisma.user.update({
    where: {
      resetToken
    },
    data: {
      password: newPassword,
      resetToken: null,
      resetTokenExpiresAt: null
    }
  })
}