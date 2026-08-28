<script setup lang="ts">
import Card from 'primevue/card';
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';
import UserIcon from '@primeicons/vue/user';
import { ref } from 'vue';
import InputText from 'primevue/inputtext';
import FloatLabel from 'primevue/floatlabel';
import Lock from '@primeicons/vue/lock';
import Button from 'primevue/button';

const isLogin = ref<boolean>(true);
const username = ref<string>('');
const password = ref<string>('');
const passwordRepeated = ref<string>('');
</script>

<template>
    <div class="login-container">
        <Card class="max-w-sm w-full" :class="isLogin ? 'front' : 'back'">
            <template #title>
                <div class="title-container">
                    <img src="https://alogar.cl/cdn/shop/files/Logo-2025_da742222-4572-4aa9-8ccb-f15ed9de1f2f.png?v=1772139348&width=330"
                        alt="">
                    <Transition name="title-switch" mode="out-in">
                        <h2 v-if="isLogin" key="login-title" class="text-center mt-1">Iniciar Sesión</h2>
                        <h2 v-else key="signup-title" class="text-center mt-1">Crear Cuenta</h2>
                    </Transition>
                </div>
            </template>
            <template #content>
                <div class="login-sub-container">
                    <Transition name="form-switch" mode="out-in">
                        <div v-if="isLogin" key="login" class="login-form">
                            <InputGroup>
                                <InputGroupAddon>
                                    <UserIcon :size="24" />
                                </InputGroupAddon>
                                <FloatLabel>
                                    <InputText v-model="username" class="user-input" />
                                    <label for="username">Usuario</label>
                                </FloatLabel>
                            </InputGroup>
                            <InputGroup>
                                <InputGroupAddon>
                                    <Lock :size="24" />
                                </InputGroupAddon>
                                <FloatLabel>
                                    <InputText v-model="password" class="password-input" />
                                    <label for="password">Contraseña</label>
                                </FloatLabel>
                            </InputGroup>
                        </div>
                        <div v-else key="signup" class="signup-form">
                            <InputGroup>
                                <InputGroupAddon>
                                    <UserIcon :size="24" />
                                </InputGroupAddon>
                                <FloatLabel>
                                    <InputText v-model="username" class="user-input" />
                                    <label for="username">Usuario</label>
                                </FloatLabel>
                            </InputGroup>
                            <InputGroup>
                                <InputGroupAddon>
                                    <Lock :size="24" />
                                </InputGroupAddon>
                                <FloatLabel>
                                    <InputText v-model="password" class="password-input" />
                                    <label for="password">Contraseña</label>
                                </FloatLabel>
                            </InputGroup>
                            <InputGroup>
                                <InputGroupAddon>
                                    <Lock :size="24" />
                                </InputGroupAddon>
                                <FloatLabel>
                                    <InputText v-model="passwordRepeated" class="password-input" />
                                    <label for="password">Repetir Contraseña</label>
                                </FloatLabel>
                            </InputGroup>
                        </div>
                    </Transition>
                    <div class="link-options">
                        <p>¿Olvidaste tu contraseña?</p>
                        <p v-on:click="isLogin = !isLogin">{{ isLogin ? 'Crear Cuenta' : 'Iniciar Sesión' }}</p>
                    </div>
                    <div class="login-button">
                        <Button>
                            {{ isLogin ? 'Iniciar Sesión' : 'Crear Cuenta' }}
                        </Button>
                    </div>
                </div>
            </template>
        </Card>
    </div>
</template>

<style scoped>
.login-container {
    width: min(100% - 2rem, 28rem);
}

.title-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    img {
        width: 200px;
        height: 50px;
    }
}

.login-sub-container {
    display: flex;
    flex-direction: column;
}

.login-form,
.signup-form {
    display: flex;
    flex-direction: column;
    gap: 25px;
}

.form-switch-enter-active,
.form-switch-leave-active,
.title-switch-enter-active,
.title-switch-leave-active {
    transition: opacity 180ms ease, transform 180ms ease;
}

.form-switch-enter-from,
.title-switch-enter-from {
    opacity: 0;
    transform: translateY(10px);
}

.form-switch-leave-to,
.title-switch-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}

.user-input.p-inputtext,
.password-input.p-inputtext {
    height: 40px;
    font-size: 16px;
}

.link-options {
    display: flex;
    align-items: center;
    justify-content: space-between;

    p {
        font-size: 16px;
        color: rgb(24, 76, 71, 0.8);
        cursor: pointer;

        &:hover {
            color: rgb(24, 76, 71);
            font-weight: bold;
        }
    }
}

.login-button {
    width: 100%;

    .p-button {
        width: 100%;
        font-size: 16px;
        background-color: rgb(24, 76, 71);
        border: none;
    }
}
</style>