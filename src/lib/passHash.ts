import argon2 from "argon2"

//função para criar uma hash para senha ficar criptografada
export async function hashPassword(password: string): Promise<string> {
  try {
    const hash = await argon2.hash(password)
    return hash
  }catch(error) {
    console.log(error)
    throw new Error("Erro ao criar a hash password")
  }
} 

//função para validar se as senhas são compativeis
export async function checkPassword(hash: string, password: string): Promise<boolean> {
  try {
    const isValid = await argon2.verify(hash, password)
    return isValid
  } catch(error) {
    console.log(error)
    throw new Error("Erro ao validar a senha")
  }
}