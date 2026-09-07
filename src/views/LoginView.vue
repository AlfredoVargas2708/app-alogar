<script setup lang="ts">
import Card from 'primevue/card';
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';
import { ref, watch } from 'vue';
import InputText from 'primevue/inputtext';
import FloatLabel from 'primevue/floatlabel';
import Button from 'primevue/button';
import { useUserStore } from '@/stores/userStore';
import InputPassword from 'primevue/inputpassword';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import { useRouter } from 'vue-router';
import LoadingView from './LoadingView.vue';
import { Eye, EyeSlash, Lock, Spinner, UserIcon } from '@/shared/icons.ts';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import Select from 'primevue/select';

const isLogin = ref<boolean>(true);
const isLoading = ref<boolean>(false);
const username = ref<string>('');
const password = ref<string>('');
const passwordMask = ref(true);
const passwordRepeated = ref<string>('');
const passwordRepeatedMask = ref(true);
const passwordRepeatedError = ref<string>('');
const userRole = ref<string>('');
const userRoleOptions = ref<unknown[]>([
    { label: 'Empleado', value: 'empleado' },
    { label: 'Administrador', value: 'admin' }
]);

const userStore = useUserStore();
const router = useRouter();
const toast = useToast();

const loginResolved = ref(false);
const loadingComplete = ref(false);
const destinationPath = ref('/home');

function goToHomeWhenReady() {
    if (loginResolved.value && loadingComplete.value) {
        router.push({ path: destinationPath.value });
    }
}

function onLoadingComplete() {
    loadingComplete.value = true;
    goToHomeWhenReady();
}

async function login() {
    const userBody = { usuario: username.value, password: password.value };
    loginResolved.value = false;
    loadingComplete.value = false;

    try {
        const user = await userStore.loginUser(userBody);
        const userRole = user.role ?? user.user_role;
        destinationPath.value = userRole === 'admin' ? '/admin' : '/home';
        loginResolved.value = true;
        isLoading.value = true;
        goToHomeWhenReady();
    } catch (error: unknown) {
        console.error(error);
        toast.add({ summary: 'Inicio Sesión', detail: 'Error al Iniciar Sesión', severity: 'error' });
    }
}

async function signup() {
    const userBody = { usuario: username.value, password: password.value, user_role: userRole.value };
    try {
        await userStore.signUpUser(userBody)
        toast.add({ summary: 'Nuevo Usuario', detail: 'Cuenta Creada Correctamente. Puede iniciar sesión con los parámetros ingresados', severity: 'success' });
        isLogin.value = true;
    } catch (error: unknown) {
        console.error(error);
        toast.add({ summary: 'Nuevo Usuario', detail: 'Error al Crear Cuenta', severity: 'error' });
    }
}

function validateSamePassword() {
    if (passwordRepeated.value && password.value !== passwordRepeated.value) {
        passwordRepeatedError.value = 'Las Contraseñas Deben Ser Iguales';
    } else {
        passwordRepeatedError.value = '';
    }
}

function disableButton(): boolean {
    const hasEmptyRequiredField = !username.value || !password.value;

    if (isLogin.value) {
        return hasEmptyRequiredField;
    }

    return hasEmptyRequiredField || !passwordRepeated.value || passwordRepeatedError.value !== '';
}

watch([password, passwordRepeated], validateSamePassword);

</script>

<template>
    <div class="login-container" v-if="!isLoading">
        <Card class="login-card max-w-sm w-full h-full" :class="isLogin ? 'front' : 'back'">
            <template #title>
                <div class="title-container">
                    <img src="/logo-alogar.avif" alt="">
                    <Transition name="title-switch" mode="out-in">
                        <h1 v-if="isLogin" key="login-title" class="text-center mt-1 font-italic">Iniciar Sesión</h1>
                        <h1 v-else key="signup-title" class="text-center mt-1 font-italic">Crear Cuenta</h1>
                    </Transition>
                </div>
            </template>
            <template #subtitle>
                <h2 class="text-center mt-0">SISTEMA DE VENTAS ALOGAR</h2>
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
                                    <IconField>
                                        <InputPassword v-model="password" :mask="passwordMask" />
                                        <InputIcon class="cursor-pointer" @click="passwordMask = !passwordMask">
                                            <Eye :size="16" v-if="passwordMask" />
                                            <EyeSlash :size="16" v-else />
                                        </InputIcon>
                                    </IconField>
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
                                    <IconField>
                                        <InputPassword v-model="password" class="password-input" :mask="passwordMask" />
                                        <InputIcon class="cursor-pointer" @click="passwordMask = !passwordMask">
                                            <Eye :size="16" v-if="passwordMask" />
                                            <EyeSlash :size="16" v-else />
                                        </InputIcon>
                                    </IconField>
                                    <label for="password">Contraseña</label>
                                </FloatLabel>
                            </InputGroup>
                            <InputGroup class="password-repeat-group">
                                <InputGroupAddon>
                                    <Lock :size="24" />
                                </InputGroupAddon>
                                <FloatLabel>
                                    <IconField>
                                        <InputPassword v-model="passwordRepeated" class="password-repeat-input"
                                            :mask="passwordRepeatedMask" :invalid="passwordRepeatedError !== ''" />
                                        <InputIcon class="cursor-pointer"
                                            @click="passwordRepeatedMask = !passwordRepeatedMask">
                                            <Eye :size="16" v-if="passwordRepeatedMask" />
                                            <EyeSlash :size="16" v-else />
                                        </InputIcon>
                                    </IconField>
                                    <label for="password">Repetir Contraseña</label>
                                </FloatLabel>
                                <span class="password-error">{{ passwordRepeatedError }}</span>
                            </InputGroup>
                            <InputGroup>
                                <InputGroupAddon>
                                    <UserIcon :size="24" />
                                </InputGroupAddon>
                                <Select v-model="userRole" :options="userRoleOptions" optionLabel="label"
                                    optionValue="value" placeholder="Seleccione rol del usuario" class="flex-1" />
                            </InputGroup>
                        </div>
                    </Transition>
                </div>
            </template>
            <template #footer>
                <div class="link-options">
                    <p>¿Olvidaste tu contraseña?</p>
                    <p v-on:click="isLogin = !isLogin">{{ isLogin ? 'Crear Cuenta' : 'Iniciar Sesión' }}</p>
                </div>
                <div class="login-button">
                    <Button v-on:click="isLogin ? login() : signup()"
                        :disabled="disableButton() || userStore.isLoading">
                        {{ isLogin ? 'Iniciar Sesión' : 'Crear Cuenta' }}
                        <Spinner spin :size="16" v-if="userStore.isLoading" />
                    </Button>
                </div>
            </template>
        </Card>
    </div>
    <div class="loading-container" v-else>
        <LoadingView @complete="onLoadingComplete" />
    </div>
    <Toast />
</template>

<style scoped>
.login-container,
.loading-container {
    width: min(100% - 2rem, 28rem);
}

.login-card :deep(.p-card-body) {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
    box-sizing: border-box;
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
.password-input.p-inputtext,
.password-repeat-input.p-inputtext {
    height: 40px;
    font-size: 16px;
}

.password-repeat-group {
    position: relative;
}

.password-error {
    position: absolute;
    top: 100%;
    font-size: 14px;
    color: light-dark(#f87171, #fca5a5);
}

.link-options {
    display: flex;
    align-items: center;
    justify-content: space-between;

    p {
        font-size: 16px;
        color: rgb(24, 76, 71);
        cursor: pointer;

        &:hover {
            font-weight: bold;
        }
    }
}

.login-button {
    width: 100%;

    .login-error {
        display: block;
        margin-top: 0.5rem;
        font-size: 14px;
        color: light-dark(#b91c1c, #fca5a5);
        text-align: center;
    }

    .p-button {
        width: 100%;
        font-size: 16px;
        background-color: rgb(24, 76, 71);
        border: none;
    }
}
</style>