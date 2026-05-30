// @ts-check
import { test, expect } from '@playwright/test';

test('Full booking Flow', async({page}) => {
  await page.goto('https://localhost:5173/booking')

  //step1

  await page.getByText('Oluwakemi Okunlola').click()
  await page.selectOption('select', 'Registered Nurse')
  await page.selectOption('select', 'Telehealth (video)')

  await page.getByText('Today').click()
  

})