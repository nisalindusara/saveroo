<!--
	Create/edit form for a merchant and its branches. Keeps everything in local state and submits it as
	one JSON "payload" to the page's `save` action; shows the API's per-field errors.
-->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { t } from '@saveroo/shared/i18n';
	import type { AdminMerchant, AdminReference, ApiError } from '@saveroo/shared';
	import Field from './Field.svelte';
	import ImageField from './ImageField.svelte';

	let {
		merchant,
		categories,
		supabaseUrl,
		error
	}: {
		merchant: AdminMerchant | null;
		categories: AdminReference['categories'];
		supabaseUrl: string;
		error: ApiError | null;
	} = $props();

	const input = 'w-full rounded-lg border border-gray-300 px-3 py-2';
	const fields = $derived(error?.fields ?? {});

	// Form state (strings for inputs; converted on submit).
	// svelte-ignore state_referenced_locally
	const m = merchant;
	let name = $state(m?.name ?? '');
	let slug = $state(m?.slug ?? '');
	let description = $state(m?.description ?? '');
	let websiteUrl = $state(m?.websiteUrl ?? '');
	let domains = $state(m?.domains.join(', ') ?? '');
	let phone = $state(m?.phone ?? '');
	let primaryCategoryId = $state(m?.primaryCategoryId ?? '');
	let isOnline = $state(m?.isOnline ?? false);
	let hasPhysicalStores = $state(m?.hasPhysicalStores ?? true);
	let isVerified = $state(m?.isVerified ?? false);
	let status = $state(m?.status ?? 'active');
	let logoKey = $state<string | null>(m?.logoKey ?? null);
	let coverKey = $state<string | null>(m?.coverKey ?? null);
	let branches = $state(
		(m?.branches ?? []).map((b) => ({
			id: b.id as string | null,
			name: b.name,
			address: b.address ?? '',
			city: b.city ?? '',
			district: b.district ?? '',
			lat: b.lat?.toString() ?? '',
			lng: b.lng?.toString() ?? '',
			phone: b.phone ?? '',
			status: b.status
		}))
	);

	const blankBranch = () => ({ id: null, name: '', address: '', city: '', district: '', lat: '', lng: '', phone: '', status: 'active' as const });
	const toNumber = (v: string) => (v.trim() === '' ? null : Number(v));

	const payload = $derived(
		JSON.stringify({
			id: m?.id ?? null,
			slug: slug.trim() || null,
			name,
			description,
			websiteUrl: websiteUrl.trim() || null,
			domains: domains.split(/[\s,]+/).filter(Boolean),
			phone,
			primaryCategoryId: primaryCategoryId || null,
			isOnline,
			hasPhysicalStores,
			isVerified,
			status,
			logoKey,
			coverKey,
			branches: branches.map((b) => ({ ...b, lat: toNumber(b.lat), lng: toNumber(b.lng) }))
		})
	);
</script>

<form method="POST" action="?/save" use:enhance class="space-y-6">
	<input type="hidden" name="payload" value={payload} />

	{#if error}
		<p class="rounded-lg bg-red-50 p-3 text-sm text-red-800" role="alert">{error.message}</p>
	{/if}

	<div class="grid gap-4 md:grid-cols-2">
		<Field label={t('admin.merchant.name')} error={fields.name}>
			<input class={input} bind:value={name} required maxlength="120" />
		</Field>
		<Field label={t('admin.slug')} error={fields.slug} hint={t('admin.slug_hint')}>
			<input class={input} bind:value={slug} maxlength="120" />
		</Field>
		<Field label={t('admin.merchant.category')} error={fields.primaryCategoryId}>
			<select class={input} bind:value={primaryCategoryId}>
				<option value="">–</option>
				{#each categories as c (c.id)}<option value={c.id}>{c.parentId ? '— ' : ''}{c.name}</option>{/each}
			</select>
		</Field>
		<Field label={t('admin.merchant.status')} error={fields.status}>
			<select class={input} bind:value={status}>
				<option value="active">{t('admin.merchant.active')}</option>
				<option value="hidden">{t('admin.merchant.hidden')}</option>
			</select>
		</Field>
		<Field label={t('admin.merchant.website')} error={fields.websiteUrl}>
			<input class={input} type="url" bind:value={websiteUrl} placeholder="https://" />
		</Field>
		<Field label={t('admin.merchant.domains')} error={fields.domains ?? fields['domains.0']} hint={t('admin.merchant.domains_hint')}>
			<input class={input} bind:value={domains} placeholder="daraz.lk, www.daraz.lk" />
		</Field>
		<Field label={t('admin.phone')} error={fields.phone}>
			<input class={input} type="tel" bind:value={phone} />
		</Field>
	</div>

	<Field label={t('admin.description')} error={fields.description}>
		<textarea class={input} rows="3" bind:value={description} maxlength="2000"></textarea>
	</Field>

	<div class="flex flex-wrap gap-6 text-sm">
		<label class="flex items-center gap-2"><input type="checkbox" bind:checked={isOnline} /> {t('admin.merchant.online')}</label>
		<label class="flex items-center gap-2"><input type="checkbox" bind:checked={hasPhysicalStores} /> {t('admin.merchant.physical')}</label>
		<label class="flex items-center gap-2"><input type="checkbox" bind:checked={isVerified} /> {t('admin.merchant.verified')}</label>
	</div>

	<div class="grid gap-4 md:grid-cols-2">
		<ImageField label={t('admin.merchant.logo')} kind="merchants" {supabaseUrl} bind:value={logoKey} error={fields.logoKey} />
		<ImageField label={t('admin.merchant.cover')} kind="merchants" {supabaseUrl} bind:value={coverKey} error={fields.coverKey} />
	</div>

	<fieldset class="space-y-3">
		<legend class="text-lg font-semibold">{t('admin.merchant.branches')}</legend>
		<p class="text-sm text-gray-600">{t('admin.merchant.branches_hint')}</p>
		{#each branches as branch, i (i)}
			<div class="grid gap-3 rounded-lg border p-3 md:grid-cols-4">
				<Field label={t('admin.branch.name')} error={fields[`branches.${i}.name`]}>
					<input class={input} bind:value={branch.name} required maxlength="120" />
				</Field>
				<Field label={t('admin.branch.address')} error={fields[`branches.${i}.address`]}>
					<input class={input} bind:value={branch.address} />
				</Field>
				<Field label={t('admin.branch.city')}><input class={input} bind:value={branch.city} /></Field>
				<Field label={t('admin.branch.district')}><input class={input} bind:value={branch.district} /></Field>
				<Field label={t('admin.branch.lat')} error={fields[`branches.${i}.lat`]}>
					<input class={input} inputmode="decimal" bind:value={branch.lat} placeholder="6.9271" />
				</Field>
				<Field label={t('admin.branch.lng')} error={fields[`branches.${i}.lng`]}>
					<input class={input} inputmode="decimal" bind:value={branch.lng} placeholder="79.8612" />
				</Field>
				<Field label={t('admin.phone')}><input class={input} bind:value={branch.phone} /></Field>
				<div class="flex items-end justify-between gap-2">
					<select class={input} bind:value={branch.status} aria-label={t('admin.merchant.status')}>
						<option value="active">{t('admin.merchant.active')}</option>
						<option value="hidden">{t('admin.merchant.hidden')}</option>
					</select>
					<button type="button" class="text-sm underline" onclick={() => branches.splice(i, 1)}>{t('admin.remove')}</button>
				</div>
			</div>
		{/each}
		<button type="button" class="rounded-lg border px-3 py-1.5 text-sm" onclick={() => branches.push(blankBranch())}>
			{t('admin.branch.add')}
		</button>
	</fieldset>

	<button type="submit" class="rounded-lg bg-black px-4 py-2 font-medium text-white">{t('admin.save')}</button>
</form>
