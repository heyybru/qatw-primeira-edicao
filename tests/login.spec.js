import { test, expect } from "@playwright/test";
import { obterCodigo2FA } from "../support/db";
import { LoginPage } from "../pages/LoginPage.js"; // Correção na importação
import { DashPage } from "../pages/DashPage.js";
import { TIMEOUT } from "dns";
import { cleanJobs, getJob } from "../support/redis.js";

test("Não deve logar quando o código de autenticação for inválido", async ({
  page,
}) => {
  const loginPage = new LoginPage(page); // Correção na instância

  const usuario = {
    cpf: "00000014141",
    senha: "147258",
  };

  await loginPage.acessarPagina();
  await loginPage.informeCpf(usuario.cpf);
  await loginPage.informeSenha(usuario.senha);
  await loginPage.informe2FA("123456");

  await expect(page.locator("span")).toContainText(
    "Código inválido. Por favor, tente novamente."
  );
});

test("Deve acessar a conta do usuário", async ({ page }) => {
  const loginPage = new LoginPage(page); // Correção na instância
  const dashPage = new DashPage(page); //

  const usuario = {
    cpf: "00000014141",
    senha: "147258",
  };

  await cleanJobs();

  await loginPage.acessarPagina();
  await loginPage.informeCpf(usuario.cpf);
  await loginPage.informeSenha(usuario.senha);

  //chackpoint
  await page
    .getByRole("heading", { name: "Verificação em duas etapas" })
    .waitFor({ timeout: 5000 }); // Aumentando para 10 segundos

  const codigo = await getJob();

  //const codigo = await obterCodigo2FA(usuario.cpf);

  await loginPage.informe2FA(codigo);

  await expect(await dashPage.obterSaldo()).toHaveText("R$ 5.000,00");
});
